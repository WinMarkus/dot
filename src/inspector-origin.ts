function applyInspectorOriginFromIcon(icon: Element) {
  const iconRect = icon.getBoundingClientRect();
  const originX = iconRect.left + iconRect.width / 2;
  const originY = iconRect.top + iconRect.height / 2;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const panel = document.querySelector<HTMLElement>('.inspector-panel');
      if (!panel) return;

      const panelRect = panel.getBoundingClientRect();
      panel.style.setProperty('--inspector-origin-local-x', `${originX - panelRect.left}px`);
      panel.style.setProperty('--inspector-origin-local-y', `${originY - panelRect.top}px`);
      panel.classList.remove('inspector-panel--from-icon');
      void panel.offsetWidth;
      panel.classList.add('inspector-panel--from-icon');
    });
  });
}

export function installInspectorOriginTracking() {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const icon = target.closest('.artifact-action--inspect');
      if (!icon) return;

      applyInspectorOriginFromIcon(icon);
    },
    true,
  );
}
