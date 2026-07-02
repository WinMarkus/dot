const DRAG_THRESHOLD_PX = 6;
const OPEN_DELAY_MS = 220;

type PendingArtifactPointer = {
  element: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  wasVisuallyOpen: boolean;
};

let pendingPointer: PendingArtifactPointer | null = null;
let pendingOpenTimer: number | null = null;

function clearPendingOpenTimer() {
  if (pendingOpenTimer === null) return;

  window.clearTimeout(pendingOpenTimer);
  pendingOpenTimer = null;
}

function getArtifactCard(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>('.artifact-card');
}

function isInsideArtifactAction(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('.artifact-action-system'));
}

function isVisuallyOpen(element: HTMLElement) {
  return element.classList.contains('artifact-card--selected') && element.dataset.openSuppressed !== 'true';
}

function suppressOpen(element: HTMLElement) {
  element.dataset.openSuppressed = 'true';
}

function allowOpen(element: HTMLElement) {
  delete element.dataset.openSuppressed;
}

document.addEventListener(
  'pointerdown',
  (event) => {
    if (isInsideArtifactAction(event.target)) return;

    const element = getArtifactCard(event.target);
    if (!element) return;

    clearPendingOpenTimer();

    const wasVisuallyOpen = isVisuallyOpen(element);

    pendingPointer = {
      element,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      wasVisuallyOpen,
    };

    if (!wasVisuallyOpen) {
      suppressOpen(element);
    }
  },
  true,
);

document.addEventListener(
  'pointermove',
  (event) => {
    if (!pendingPointer || pendingPointer.pointerId !== event.pointerId) return;

    const distance = Math.abs(event.clientX - pendingPointer.startX) + Math.abs(event.clientY - pendingPointer.startY);

    if (distance > DRAG_THRESHOLD_PX) {
      pendingPointer.moved = true;
    }
  },
  true,
);

document.addEventListener(
  'pointerup',
  (event) => {
    if (!pendingPointer || pendingPointer.pointerId !== event.pointerId) return;

    const pointer = pendingPointer;
    pendingPointer = null;

    if (pointer.wasVisuallyOpen) return;

    if (pointer.moved) {
      suppressOpen(pointer.element);
      return;
    }

    clearPendingOpenTimer();
    pendingOpenTimer = window.setTimeout(() => {
      allowOpen(pointer.element);
      pendingOpenTimer = null;
    }, OPEN_DELAY_MS);
  },
  true,
);

document.addEventListener(
  'pointercancel',
  (event) => {
    if (!pendingPointer || pendingPointer.pointerId !== event.pointerId) return;

    suppressOpen(pendingPointer.element);
    pendingPointer = null;
  },
  true,
);
