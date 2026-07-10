type Point = { x: number; y: number };
type CameraState = { x: number; y: number; zoom: number };
type DotSetupState = Record<string, unknown>;

type GestureState = {
  startDistance: number;
  startMidpoint: Point;
  startCamera: CameraState;
  startWorldAtMidpoint: Point;
};

const MIN_MOBILE_ZOOM = 0.26;
const MAX_MOBILE_ZOOM = 2.4;

function getSetupState(rootInstance: unknown): DotSetupState | null {
  const instance = rootInstance as { $?: { setupState?: DotSetupState } } | null;
  return instance?.$?.setupState ?? null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCamera(state: DotSetupState): CameraState {
  const camera = state.camera as Partial<CameraState> | null;
  return {
    x: Number.isFinite(camera?.x) ? Number(camera?.x) : 0,
    y: Number.isFinite(camera?.y) ? Number(camera?.y) : 0,
    zoom: Number.isFinite(camera?.zoom) ? Number(camera?.zoom) : 1,
  };
}

function setCamera(state: DotSetupState, camera: CameraState) {
  state.camera = {
    x: camera.x,
    y: camera.y,
    zoom: clamp(camera.zoom, MIN_MOBILE_ZOOM, MAX_MOBILE_ZOOM),
  };
}

function distance(a: Touch, b: Touch) {
  return Math.max(1, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY));
}

function midpoint(a: Touch, b: Touch): Point {
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  };
}

function screenToWorld(point: Point, camera: CameraState): Point {
  return {
    x: (point.x - camera.x) / camera.zoom,
    y: (point.y - camera.y) / camera.zoom,
  };
}

function shouldIgnoreTouchStart(event: TouchEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;

  return Boolean(
    target.closest(
      '.command-bar, .model-dock, .model-picker, .github-save-dock, .canvas-help, .theme-dots, .inspector-panel, input, textarea, select',
    ),
  );
}

function clearSinglePointerDragStates(state: DotSetupState) {
  state.panState = null;
  state.dotDragState = null;
  state.artifactDragState = null;
  state.deletedMarkerDragState = null;
  state.inspectorDragState = null;
  state.connectDragState = null;
  state.lassoState = null;
  state.constellation = null;
  state.dropTargetArtifactId = null;
}

export function installMobileCanvasGestures(rootInstance: unknown) {
  const setupState = getSetupState(rootInstance);
  if (!setupState) {
    console.warn('[dot:mobile] setup state unavailable; mobile gestures disabled');
    return;
  }

  const state: DotSetupState = setupState;
  let gesture: GestureState | null = null;

  function startGesture(event: TouchEvent) {
    if (event.touches.length < 2 || shouldIgnoreTouchStart(event)) return;

    const first = event.touches[0];
    const second = event.touches[1];
    const startCamera = getCamera(state);
    const startMidpoint = midpoint(first, second);

    clearSinglePointerDragStates(state);
    gesture = {
      startDistance: distance(first, second),
      startMidpoint,
      startCamera,
      startWorldAtMidpoint: screenToWorld(startMidpoint, startCamera),
    };

    document.documentElement.classList.add('mobile-canvas-gesture-active');
    event.preventDefault();
    event.stopPropagation();
  }

  function moveGesture(event: TouchEvent) {
    if (!gesture) return;

    if (event.touches.length < 2) {
      endGesture();
      return;
    }

    const first = event.touches[0];
    const second = event.touches[1];
    const nextMidpoint = midpoint(first, second);
    const nextZoom = clamp(
      gesture.startCamera.zoom * (distance(first, second) / gesture.startDistance),
      MIN_MOBILE_ZOOM,
      MAX_MOBILE_ZOOM,
    );

    setCamera(state, {
      x: nextMidpoint.x - gesture.startWorldAtMidpoint.x * nextZoom,
      y: nextMidpoint.y - gesture.startWorldAtMidpoint.y * nextZoom,
      zoom: nextZoom,
    });

    clearSinglePointerDragStates(state);
    event.preventDefault();
    event.stopPropagation();
  }

  function endGesture() {
    gesture = null;
    document.documentElement.classList.remove('mobile-canvas-gesture-active');
  }

  document.addEventListener('touchstart', startGesture, { capture: true, passive: false });
  document.addEventListener('touchmove', moveGesture, { capture: true, passive: false });
  document.addEventListener('touchend', endGesture, { capture: true, passive: false });
  document.addEventListener('touchcancel', endGesture, { capture: true, passive: false });
}
