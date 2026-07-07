const LIGHTBOX_CLASS = 'component-lightbox';
const COMPONENT_SELECTOR = '.component-frame';
const EXPAND_CLASS = 'component-expand-button';

let lightbox: HTMLElement | null = null;
let frame: HTMLIFrameElement | null = null;
let titleEl: HTMLElement | null = null;

function ensureLightbox() {
  if (lightbox && frame && titleEl) return { lightbox, frame, titleEl };

  lightbox = document.createElement('div');
  lightbox.className = LIGHTBOX_CLASS;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Enlarged generated component');
  lightbox.innerHTML = `
    <button class="component-lightbox__backdrop" type="button" aria-label="Close enlarged component"></button>
    <section class="component-lightbox__frame-shell">
      <header class="component-lightbox__header">
        <span class="component-lightbox__eyebrow">component preview</span>
        <strong class="component-lightbox__title"></strong>
        <button class="component-lightbox__close" type="button" aria-label="Close enlarged component">×</button>
      </header>
      <iframe class="component-lightbox__frame" title="Enlarged sandboxed generated component" sandbox="allow-scripts"></iframe>
    </section>
  `;

  frame = lightbox.querySelector('.component-lightbox__frame');
  titleEl = lightbox.querySelector('.component-lightbox__title');
  document.body.appendChild(lightbox);

  lightbox.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.component-lightbox__close, .component-lightbox__backdrop')) closeLightbox();
  });

  return { lightbox, frame: frame!, titleEl: titleEl! };
}

function getComponentTitle(source: HTMLIFrameElement) {
  const card = source.closest('.artifact-card');
  const title = card?.querySelector('h2')?.textContent?.trim();
  return title || 'Generated component';
}

function openLightbox(source: HTMLIFrameElement) {
  const parts = ensureLightbox();
  parts.frame.srcdoc = source.srcdoc || '<!doctype html><body>No component preview available.</body>';
  parts.titleEl.textContent = getComponentTitle(source);
  parts.lightbox.classList.add('component-lightbox--open');
  document.documentElement.classList.add('component-lightbox-open');
  parts.lightbox.querySelector<HTMLButtonElement>('.component-lightbox__close')?.focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lightbox || !frame) return;
  lightbox.classList.remove('component-lightbox--open');
  document.documentElement.classList.remove('component-lightbox-open');
  window.setTimeout(() => {
    if (!lightbox?.classList.contains('component-lightbox--open') && frame) frame.removeAttribute('srcdoc');
  }, 180);
}

function installExpandButtonForFrame(componentFrame: HTMLIFrameElement) {
  const host = componentFrame.parentElement;
  if (!host || host.querySelector(`.${EXPAND_CLASS}`)) return;

  if (getComputedStyle(host).position === 'static') {
    host.style.position = 'relative';
  }

  const button = document.createElement('button');
  button.className = EXPAND_CLASS;
  button.type = 'button';
  button.textContent = 'expand';
  button.setAttribute('aria-label', `Enlarge component preview: ${getComponentTitle(componentFrame)}`);

  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openLightbox(componentFrame);
  });

  host.appendChild(button);
}

function installExpandButtons() {
  document.querySelectorAll<HTMLIFrameElement>(COMPONENT_SELECTOR).forEach(installExpandButtonForFrame);
}

export function installComponentLightbox() {
  installExpandButtons();

  new MutationObserver(() => installExpandButtons()).observe(document.body, { childList: true, subtree: true });

  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(`.${EXPAND_CLASS}`)) event.stopPropagation();
    },
    true,
  );

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('component-lightbox--open')) {
      event.preventDefault();
      closeLightbox();
    }
  });
}
