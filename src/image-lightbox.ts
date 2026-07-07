const LIGHTBOX_CLASS = 'image-lightbox';
const IMAGE_SELECTOR = '.image-result img';

let lightbox: HTMLElement | null = null;
let image: HTMLImageElement | null = null;
let caption: HTMLElement | null = null;

function ensureLightbox() {
  if (lightbox && image && caption) return { lightbox, image, caption };

  lightbox = document.createElement('div');
  lightbox.className = LIGHTBOX_CLASS;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Enlarged generated image');
  lightbox.innerHTML = `
    <button class="image-lightbox__backdrop" type="button" aria-label="Close enlarged image"></button>
    <figure class="image-lightbox__frame">
      <img class="image-lightbox__image" alt="" draggable="false" />
      <figcaption class="image-lightbox__caption"></figcaption>
      <button class="image-lightbox__close" type="button" aria-label="Close enlarged image">×</button>
    </figure>
  `;

  image = lightbox.querySelector('.image-lightbox__image');
  caption = lightbox.querySelector('.image-lightbox__caption');
  document.body.appendChild(lightbox);

  lightbox.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.image-lightbox__close, .image-lightbox__backdrop')) closeLightbox();
  });

  return { lightbox, image: image!, caption: caption! };
}

function openLightbox(source: HTMLImageElement) {
  const parts = ensureLightbox();
  parts.image.src = source.currentSrc || source.src;
  parts.image.alt = source.alt || 'Generated image';
  parts.caption.textContent = source.alt || '';
  parts.lightbox.classList.add('image-lightbox--open');
  document.documentElement.classList.add('image-lightbox-open');
  parts.lightbox.querySelector<HTMLButtonElement>('.image-lightbox__close')?.focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lightbox || !image) return;
  lightbox.classList.remove('image-lightbox--open');
  document.documentElement.classList.remove('image-lightbox-open');
  window.setTimeout(() => {
    if (!lightbox?.classList.contains('image-lightbox--open') && image) image.removeAttribute('src');
  }, 180);
}

export function installImageLightbox() {
  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(IMAGE_SELECTOR)) {
        // Prevent the parent bubble drag handler from grabbing simple image taps.
        event.stopPropagation();
      }
    },
    true,
  );

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const clickedImage = target.closest<HTMLImageElement>(IMAGE_SELECTOR);
      if (!clickedImage) return;

      event.preventDefault();
      event.stopPropagation();
      openLightbox(clickedImage);
    },
    true,
  );

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('image-lightbox--open')) {
      event.preventDefault();
      closeLightbox();
    }
  });
}
