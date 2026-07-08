type ArtifactContent = {
  text?: string;
  markdown?: string;
  summary?: string;
  description?: string;
  html?: string;
  css?: string;
  js?: string;
  raw?: string;
};

type ArtifactLike = {
  kind?: string;
  title?: string;
  content?: ArtifactContent;
};

type DotSetupState = Record<string, unknown>;

const BUTTON_CLASS = 'artifact-expand-button';
const LIGHTBOX_CLASS = 'artifact-preview-lightbox';

let lightbox: HTMLElement | null = null;
let titleEl: HTMLElement | null = null;
let bodyEl: HTMLElement | null = null;
let stateRef: DotSetupState | null = null;

function getSetupState(rootInstance: unknown): DotSetupState | null {
  const instance = rootInstance as { $?: { setupState?: DotSetupState } } | null;
  return instance?.$?.setupState ?? null;
}

function getArtifacts(state: DotSetupState): ArtifactLike[] {
  return Array.isArray(state.artifacts) ? (state.artifacts as ArtifactLike[]) : [];
}

function getArtifactIdFromCard(card: Element) {
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
  } else {
    const article = document.createElement('article');
    article.className = 'artifact-preview-lightbox__reader';
    const text = content.markdown || content.text || content.summary || content.description || content.raw || '';
    article.innerHTML = escapeHtml(text || 'No readable text available.').replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
    if (!article.innerHTML.startsWith('<p>')) article.innerHTML = `<p>${article.innerHTML}</p>`;
    parts.bodyEl.appendChild(article);
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

function buttonLabel(kind: string | undefined) {
  if (kind === 'component') return 'expand';
  if (kind === 'text') return 'read';
  return 'open';
}

function installButton(card: HTMLElement) {
  if (card.querySelector(`.${BUTTON_CLASS}`)) return;
  const artifact = getArtifactForCard(card);
  if (!artifact || !['text', 'component'].includes(String(artifact.kind))) return;

  const contentHost = card.querySelector<HTMLElement>('.artifact-content') ?? card;
  if (getComputedStyle(contentHost).position === 'static') contentHost.style.position = 'relative';

  const button = document.createElement('button');
  button.className = BUTTON_CLASS;
  button.type = 'button';
  button.textContent = buttonLabel(artifact.kind);
  button.setAttribute('aria-label', `${button.textContent} ${artifact.title || 'artifact'}`);
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const latest = getArtifactForCard(card) ?? artifact;
    openArtifactPreview(latest);
  });

  contentHost.appendChild(button);
}

function installButtons() {
  document.querySelectorAll<HTMLElement>('.artifact-card').forEach(installButton);
}

export function installArtifactPreviewLightbox(rootInstance: unknown) {
  stateRef = getSetupState(rootInstance);
  if (!stateRef) {
    console.warn('[dot:preview] setup state unavailable; preview lightbox disabled');
    return;
  }

  installButtons();
  new MutationObserver(() => installButtons()).observe(document.body, { childList: true, subtree: true });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('artifact-preview-lightbox--open')) {
      event.preventDefault();
      closeLightbox();
    }
  });
}
