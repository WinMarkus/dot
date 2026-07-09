type Point = { x: number; y: number };
type CameraState = { x: number; y: number; zoom: number };
type DotSetupState = Record<string, unknown>;

const MIN_ZOOM = 0.26;
const MAX_ZOOM = 2.4;

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
    zoom: clamp(camera.zoom, MIN_ZOOM, MAX_ZOOM),
  };
}

function screenToWorld(point: Point, camera: CameraState): Point {
  return {
    x: (point.x - camera.x) / camera.zoom,
    y: (point.y - camera.y) / camera.zoom,
  };
}

function shouldSkip(event: WheelEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;
  return Boolean(target.closest('.model-picker, .canvas-help__panel, .inspector-panel, .image-lightbox, .artifact-preview-lightbox, textarea, select'));
}

export function installCanvasWheelZoom(rootInstance: unknown) {
  const state = getSetupState(rootInstance);
  if (!state) {
    console.warn('[dot:zoom] setup state unavailable; wheel zoom disabled');
    return;
  }

  document.addEventListener(
    'wheel',
    (event) => {
      if (shouldSkip(event)) return;

      event.preventDefault();
      const camera = getCamera(state);
      const anchor = { x: event.clientX, y: event.clientY };
      const world = screenToWorld(anchor, camera);
      const delta = Math.max(-120, Math.min(120, event.deltaY));
      const nextZoom = clamp(camera.zoom * Math.exp(-delta * 0.0018), MIN_ZOOM, MAX_ZOOM);

      setCamera(state, {
        x: anchor.x - world.x * nextZoom,
        y: anchor.y - world.y * nextZoom,
        zoom: nextZoom,
      });
    },
    { capture: true, passive: false },
  );
}
