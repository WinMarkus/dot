type ArtifactContent = {
  text?: string;
  markdown?: string;
  summary?: string;
  description?: string;
  html?: string;
  css?: string;
  js?: string;
  raw?: string;
  data?: unknown;
  ports?: unknown;
  tags?: string[];
  imageUrl?: string;
  alt?: string;
  storyboard?: string[];
};

type ArtifactLike = {
  kind?: string;
  title?: string;
  content?: ArtifactContent;
};

type DotSetupState = Record<string, unknown>;

const LIGHTBOX_CLASS = 'artifact-preview-lightbox';

let lightbox: HTMLElement | null = null;
let titleEl: HTMLElement | null = null;
let bodyEl: HTMLElement | null = null;
let stateRef: DotSetupState | null = null;
let pointerState: { card: HTMLElement; pointerId: number; startX: number; startY: number; moved: boolean } | null = null;

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

function componentSrcDoc(content: ArtifactContent) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body { margin: 0; min-height: 100%; background: transparent; color: #f6f1e8; font-family: Inter, system-ui, sans-serif; }
  * { box-sizing: border-box; }
  ${content.css || ''}
</style>
</head>
<body>
${content.html || '<main style="padding:24px">No component HTML available.</main>'}
<script>
try {
${content.js || ''}
} catch (error) {
  document.body.insertAdjacentHTML('beforeend', '<pre style="color:#ffb4a8;padding:16px;white-space:pre-wrap">' + String(error) + '</pre>');
}
</script>
</body>
</html>`;
}

function ensureLightbox() {
  if (lightbox && titleEl && bodyEl) return { lightbox, titleEl, bodyEl };

  lightbox = document.createElement('div');
  lightbox.className = LIGHTBOX_CLASS;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Large artifact preview');
  lightbox.innerHTML = `
    <button class="artifact-preview-lightbox__backdrop" type="button" aria-label="Close preview"></button>
    <section class="artifact-preview-lightbox__shell">
      <header class="artifact-preview-lightbox__header">
        <span class="artifact-preview-lightbox__eyebrow">preview</span>
        <strong class="artifact-preview-lightbox__title"></strong>
        <button class="artifact-preview-lightbox__close" type="button" aria-label="Close preview">×</button>
      </header>
      <div class="artifact-preview-lightbox__body"></div>
    </section>
  `;

  titleEl = lightbox.querySelector('.artifact-preview-lightbox__title');
  bodyEl = lightbox.querySelector('.artifact-preview-lightbox__body');
  document.body.appendChild(lightbox);

  lightbox.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.artifact-preview-lightbox__close, .artifact-preview-lightbox__backdrop')) closeLightbox();
  });

  return { lightbox, titleEl: titleEl!, bodyEl: bodyEl! };
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

function openArtifactPreview(artifact: ArtifactLike) {
  const parts = ensureLightbox();
  const content = artifact.content ?? {};
  const title = artifact.title || 'Artifact preview';
  parts.titleEl.textContent = title;
  parts.bodyEl.innerHTML = '';

  if (artifact.kind === 'component') {
    const iframe = document.createElement('iframe');
    iframe.className = 'artifact-preview-lightbox__component-frame';
    iframe.title = title;
    iframe.sandbox.add('allow-scripts');
    iframe.srcdoc = componentSrcDoc(content);
    parts.bodyEl.appendChild(iframe);
  } else if (artifact.kind === 'object') {
    appendObjectPreview(parts.bodyEl, content);
  } else if (artifact.kind === 'video') {
    appendVideoPreview(parts.bodyEl, content);
  } else {
    appendReader(parts.bodyEl, content);
  }

  parts.lightbox.classList.add('artifact-preview-lightbox--open');
  document.documentElement.classList.add('artifact-preview-lightbox-open');
  parts.lightbox.querySelector<HTMLButtonElement>('.artifact-preview-lightbox__close')?.focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lightbox || !bodyEl) return;
  lightbox.classList.remove('artifact-preview-lightbox--open');
  document.documentElement.classList.remove('artifact-preview-lightbox-open');
  window.setTimeout(() => {
    if (!lightbox?.classList.contains('artifact-preview-lightbox--open') && bodyEl) bodyEl.innerHTML = '';
  }, 180);
}

function shouldIgnoreBubbleOpen(target: Element) {
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

export function installArtifactPreviewLightbox(rootInstance: unknown) {
  stateRef = getSetupState(rootInstance);
  if (!stateRef) {
    console.warn('[dot:preview] setup state unavailable; preview lightbox disabled');
    return;
  }

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
      if (artifact) openArtifactPreview(artifact);
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
