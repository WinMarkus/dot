import type { ArtifactContent } from './types';

type ArtifactLike = {
  id?: string;
  kind?: string;
  title?: string;
  content?: ArtifactContent;
};

type DotSetupState = Record<string, unknown>;

const LIGHTBOX_CLASS = 'artifact-preview-lightbox';
const LIGHTBOX_INERT_OWNER = 'data-dot-preview-inert-owned';

let lightbox: HTMLElement | null = null;
let titleEl: HTMLElement | null = null;
let bodyEl: HTMLElement | null = null;
let eyebrowEl: HTMLElement | null = null;
let previouslyFocused: HTMLElement | null = null;
let stateRef: DotSetupState | null = null;
let pointerState: {
  card: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  wasSelected: boolean;
} | null = null;

function getSetupState(rootInstance: unknown): DotSetupState | null {
  const instance = rootInstance as { $?: { setupState?: DotSetupState } } | null;
  return instance?.$?.setupState ?? null;
}

function getArtifacts(state: DotSetupState): ArtifactLike[] {
  return Array.isArray(state.artifacts) ? (state.artifacts as ArtifactLike[]) : [];
}

function getArtifactIdFromCard(card: Element) {
  const cardId = card.getAttribute('data-artifact-id');
  if (cardId) return cardId;

  // Older saved canvases may be rendered without the card data attribute.
  // Keep the action-root lookup as a graceful compatibility fallback.
  const actionRoot = card.querySelector<HTMLElement>('.artifact-action-root');
  const controls = actionRoot?.getAttribute('aria-controls');
  return controls?.startsWith('artifact-') ? controls.slice('artifact-'.length) : null;
}

function getArtifactForCard(card: Element): ArtifactLike | null {
  if (!stateRef) return null;
  const id = getArtifactIdFromCard(card);
  if (!id) return null;
  return getArtifacts(stateRef).find((artifact) => (artifact as { id?: string }).id === id) ?? null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function readableText(content: ArtifactContent) {
  return content.markdown || content.text || content.summary || content.description || content.raw || '';
}

function ensureLightbox() {
  if (lightbox && titleEl && bodyEl && eyebrowEl) return { lightbox, titleEl, bodyEl, eyebrowEl };

  lightbox = document.createElement('div');
  lightbox.className = LIGHTBOX_CLASS;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-labelledby', 'artifact-preview-lightbox-title');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.setAttribute('inert', '');
  lightbox.innerHTML = `
    <button class="artifact-preview-lightbox__backdrop" type="button" aria-label="Close preview"></button>
    <section class="artifact-preview-lightbox__shell" tabindex="-1">
      <header class="artifact-preview-lightbox__header">
        <span class="artifact-preview-lightbox__eyebrow"><i aria-hidden="true"></i><span>preview</span></span>
        <strong class="artifact-preview-lightbox__title" id="artifact-preview-lightbox-title"></strong>
        <button class="artifact-preview-lightbox__close" type="button" aria-label="Fold back into the canvas">
          <span aria-hidden="true">×</span><small>fold</small>
        </button>
      </header>
      <div class="artifact-preview-lightbox__body"></div>
    </section>
  `;

  titleEl = lightbox.querySelector('.artifact-preview-lightbox__title');
  bodyEl = lightbox.querySelector('.artifact-preview-lightbox__body');
  eyebrowEl = lightbox.querySelector('.artifact-preview-lightbox__eyebrow span');
  document.body.appendChild(lightbox);

  lightbox.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.artifact-preview-lightbox__close, .artifact-preview-lightbox__backdrop')) closeLightbox();
  });

  return { lightbox, titleEl: titleEl!, bodyEl: bodyEl!, eyebrowEl: eyebrowEl! };
}

function setLightboxBackgroundInert(active: boolean) {
  if (!lightbox) return;

  if (!active) {
    document.querySelectorAll(`[${LIGHTBOX_INERT_OWNER}]`).forEach((element) => {
      element.removeAttribute('inert');
      element.removeAttribute(LIGHTBOX_INERT_OWNER);
    });
    return;
  }

  Array.from(document.body.children).forEach((element) => {
    if (element === lightbox || element.hasAttribute('inert')) return;
    element.setAttribute('inert', '');
    element.setAttribute(LIGHTBOX_INERT_OWNER, '');
  });
}

function focusLightbox() {
  lightbox?.querySelector<HTMLElement>('.artifact-preview-lightbox__shell')?.focus({ preventScroll: true });
}

function handleLightboxFocusIn(event: FocusEvent) {
  if (!lightbox?.classList.contains('artifact-preview-lightbox--open')) return;
  if (event.target instanceof Node && lightbox.contains(event.target)) return;
  focusLightbox();
}

function appendReader(body: HTMLElement, content: ArtifactContent) {
  const article = document.createElement('article');
  article.className = 'artifact-preview-lightbox__reader';
  const text = readableText(content);
  article.innerHTML = escapeHtml(text || 'No readable text available.').replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
  if (!article.innerHTML.startsWith('<p>')) article.innerHTML = `<p>${article.innerHTML}</p>`;
  body.appendChild(article);
}

function appendObjectPreview(body: HTMLElement, content: ArtifactContent) {
  const section = document.createElement('section');
  section.className = 'artifact-preview-lightbox__object';
  const text = readableText(content);
  const tags = Array.isArray(content.tags) ? content.tags : [];
  const payload = {
    data: content.data ?? null,
    ports: content.ports ?? null,
  };

  section.innerHTML = `
    <article class="artifact-preview-lightbox__reader artifact-preview-lightbox__reader--object">
      <p>${escapeHtml(text || 'No object description available.')}</p>
      ${tags.length ? `<div class="artifact-preview-lightbox__tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
    </article>
    <pre class="artifact-preview-lightbox__json">${escapeHtml(prettyJson(payload))}</pre>
  `;
  body.appendChild(section);
}

function appendVideoPreview(body: HTMLElement, content: ArtifactContent) {
  const section = document.createElement('section');
  section.className = 'artifact-preview-lightbox__video';
  const beats = Array.isArray(content.storyboard) ? content.storyboard : [];
  section.innerHTML = `
    <div class="artifact-preview-lightbox__video-symbol">▶</div>
    <article class="artifact-preview-lightbox__reader">
      <p>${escapeHtml(readableText(content) || 'Video concept preview.')}</p>
      ${beats.length ? `<ol>${beats.map((beat) => `<li>${escapeHtml(beat)}</li>`).join('')}</ol>` : ''}
    </article>
  `;
  body.appendChild(section);
}

function setBloomOrigin(origin?: Element | null) {
  if (!lightbox || !origin) {
    lightbox?.style.setProperty('--bloom-origin-x', '50%');
    lightbox?.style.setProperty('--bloom-origin-y', '50%');
    return;
  }

  const bounds = origin.getBoundingClientRect();
  const x = ((bounds.left + bounds.width / 2) / Math.max(window.innerWidth, 1)) * 100;
  const y = ((bounds.top + bounds.height / 2) / Math.max(window.innerHeight, 1)) * 100;
  lightbox.style.setProperty('--bloom-origin-x', `${Math.max(4, Math.min(96, x))}%`);
  lightbox.style.setProperty('--bloom-origin-y', `${Math.max(4, Math.min(96, y))}%`);
}

function openArtifactPreview(artifact: ArtifactLike, origin?: Element | null) {
  const parts = ensureLightbox();
  const content = artifact.content ?? { raw: '' };
  const title = artifact.title || 'Artifact preview';
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setBloomOrigin(origin);
  parts.titleEl.textContent = title;
  parts.eyebrowEl.textContent = 'preview';
  parts.bodyEl.innerHTML = '';
  parts.lightbox.scrollTop = 0;

  if (artifact.kind === 'object') {
    appendObjectPreview(parts.bodyEl, content);
  } else if (artifact.kind === 'video') {
    appendVideoPreview(parts.bodyEl, content);
  } else {
    appendReader(parts.bodyEl, content);
  }

  parts.lightbox.classList.add('artifact-preview-lightbox--open');
  parts.lightbox.removeAttribute('inert');
  parts.lightbox.setAttribute('aria-hidden', 'false');
  setLightboxBackgroundInert(true);
  document.documentElement.classList.add('artifact-preview-lightbox-open');
  window.requestAnimationFrame(focusLightbox);
}

function closeLightbox() {
  if (!lightbox || !bodyEl) return;
  lightbox.classList.remove('artifact-preview-lightbox--open');
  lightbox.setAttribute('inert', '');
  lightbox.setAttribute('aria-hidden', 'true');
  setLightboxBackgroundInert(false);
  document.documentElement.classList.remove('artifact-preview-lightbox-open');
  previouslyFocused?.focus({ preventScroll: true });
  previouslyFocused = null;
  window.setTimeout(() => {
    if (!lightbox?.classList.contains('artifact-preview-lightbox--open') && bodyEl) {
      bodyEl.innerHTML = '';
    }
  }, 420);
}

function shouldIgnoreBubbleOpen(target: Element) {
  if (document.querySelector('.workspace--weave-targeting')) return true;
  return Boolean(
    target.closest(
      '.artifact-action-system, .artifact-action-root, .artifact-action, .weave-halo, .nested-bubbles, .deleted-marker, .image-lightbox, .artifact-preview-lightbox, button, input, textarea, select',
    ),
  );
}

function previewCardFromTarget(target: Element) {
  const card = target.closest<HTMLElement>('.artifact-card');
  if (!card || card.classList.contains('artifact-card--kind-image')) return null;
  if (!getArtifactForCard(card)) return null;
  return card;
}

function handleOpenArtifactEvent(event: Event) {
  const detail = (event as CustomEvent<{ artifactId?: unknown; origin?: unknown }>).detail;
  if (!detail || typeof detail.artifactId !== 'string' || !stateRef) return;
  const artifact = getArtifacts(stateRef).find((candidate) => candidate.id === detail.artifactId);
  if (!artifact || artifact.kind === 'component') return;
  openArtifactPreview(artifact, detail.origin instanceof Element ? detail.origin : null);
}

function requestArtifactOpen(artifact: ArtifactLike, origin?: Element | null) {
  if (!artifact.id) {
    openArtifactPreview(artifact, origin);
    return;
  }

  document.dispatchEvent(
    new CustomEvent('dot:open-artifact', {
      detail: { artifactId: artifact.id, origin: origin ?? undefined },
    }),
  );
}

export function installArtifactPreviewLightbox(rootInstance: unknown) {
  stateRef = getSetupState(rootInstance);
  if (!stateRef) {
    console.warn('[dot:preview] setup state unavailable; preview lightbox disabled');
    return;
  }
  document.addEventListener('dot:open-artifact', handleOpenArtifactEvent);
  document.addEventListener('focusin', handleLightboxFocusIn);

  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element) || shouldIgnoreBubbleOpen(target)) return;
      const card = previewCardFromTarget(target);
      if (!card) return;

      pointerState = {
        card,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
        wasSelected: card.classList.contains('artifact-card--selected') && card.dataset.openSuppressed !== 'true',
      };
    },
    true,
  );

  document.addEventListener(
    'pointermove',
    (event) => {
      if (!pointerState || pointerState.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - pointerState.startX, event.clientY - pointerState.startY) > 8) {
        pointerState.moved = true;
      }
    },
    true,
  );

  document.addEventListener(
    'pointerup',
    (event) => {
      const state = pointerState;
      pointerState = null;
      if (!state || state.pointerId !== event.pointerId || state.moved) return;

      const target = event.target;
      if (!(target instanceof Element) || shouldIgnoreBubbleOpen(target)) return;
      const card = previewCardFromTarget(target);
      if (!card || card !== state.card) return;

      const artifact = getArtifactForCard(card);
      // Components unfold in two organic steps: bubble, then habitat. A first
      // tap opens the bubble; a second membrane tap (or the bloom seed) enters
      // the spacious live surface.
      if (artifact?.kind === 'component' && !state.wasSelected) return;
      if (artifact?.kind === 'component') requestArtifactOpen(artifact, card);
      else if (artifact) openArtifactPreview(artifact, card);
    },
    true,
  );

  document.addEventListener('pointercancel', () => {
    pointerState = null;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('artifact-preview-lightbox--open')) {
      event.preventDefault();
      closeLightbox();
    }
  });
}
