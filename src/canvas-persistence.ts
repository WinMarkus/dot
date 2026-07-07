import type { Artifact, ArtifactConnection, CameraState, DeletedMarker, Point } from './types';

type DotSnapshot = {
  version: 1;
  savedAt: string;
  dot: Point;
  camera: CameraState;
  artifacts: Artifact[];
  deletedMarkers: DeletedMarker[];
  connections: ArtifactConnection[];
  selectedArtifactId: string | null;
  theme?: string | null;
};

type DotSetupState = Record<string, unknown>;

const SAVE_TOKEN_STORAGE_KEY = 'dot:save-token';
const MAX_INLINE_IMAGE_URL_LENGTH = 12_000;

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}

function getSetupState(rootInstance: unknown): DotSetupState | null {
  const instance = rootInstance as { $?: { setupState?: DotSetupState } } | null;
  return instance?.$?.setupState ?? null;
}

function arrayValue<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function pointValue(value: unknown, fallback: Point): Point {
  const point = value as Partial<Point> | null;
  return {
    x: Number.isFinite(point?.x) ? Number(point?.x) : fallback.x,
    y: Number.isFinite(point?.y) ? Number(point?.y) : fallback.y,
  };
}

function cameraValue(value: unknown): CameraState {
  const camera = value as Partial<CameraState> | null;
  return {
    x: Number.isFinite(camera?.x) ? Number(camera?.x) : 0,
    y: Number.isFinite(camera?.y) ? Number(camera?.y) : 0,
    zoom: Number.isFinite(camera?.zoom) ? Number(camera?.zoom) : 1,
  };
}

function sanitizeArtifactForSnapshot(artifact: Artifact): Artifact {
  const copy = cloneJson(artifact);
  const imageUrl = copy.content?.imageUrl;

  if (typeof imageUrl === 'string' && (imageUrl.startsWith('data:') || imageUrl.length > MAX_INLINE_IMAGE_URL_LENGTH)) {
    delete copy.content.imageUrl;
    if (copy.content.imageStatus === 'ready') delete copy.content.imageStatus;
  }

  if (copy.content?.imageStatus === 'pending') delete copy.content.imageStatus;
  return copy;
}

function sanitizeMarkerForSnapshot(marker: DeletedMarker): DeletedMarker {
  const copy = cloneJson(marker);
  copy.artifact = sanitizeArtifactForSnapshot(copy.artifact);
  return copy;
}

function buildSnapshot(state: DotSetupState): DotSnapshot {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    dot: pointValue(state.dot, { x: 0, y: 0 }),
    camera: cameraValue(state.camera),
    artifacts: arrayValue<Artifact>(state.artifacts).map(sanitizeArtifactForSnapshot),
    deletedMarkers: arrayValue<DeletedMarker>(state.deletedMarkers).map(sanitizeMarkerForSnapshot),
    connections: arrayValue<ArtifactConnection>(state.connections).map((connection) => cloneJson(connection)),
    selectedArtifactId: typeof state.selectedArtifactId === 'string' ? state.selectedArtifactId : null,
    theme: typeof state.theme === 'string' ? state.theme : null,
  };
}

function isSnapshot(value: unknown): value is DotSnapshot {
  const snapshot = value as Partial<DotSnapshot> | null;
  return Boolean(snapshot && snapshot.version === 1 && Array.isArray(snapshot.artifacts));
}

function applySnapshot(state: DotSetupState, snapshot: DotSnapshot) {
  state.dot = pointValue(snapshot.dot, { x: 0, y: 0 });
  state.camera = cameraValue(snapshot.camera);
  state.artifacts = cloneJson(snapshot.artifacts ?? []);
  state.deletedMarkers = cloneJson(snapshot.deletedMarkers ?? []);
  state.connections = cloneJson(snapshot.connections ?? []);
  state.selectedArtifactId = snapshot.selectedArtifactId ?? null;
  state.activeActionArtifactId = null;
  state.inspectedArtifactId = null;
  state.dropTargetArtifactId = null;
  state.deletingArtifactIds = [];
  state.artifactDragState = null;
  state.deletedMarkerDragState = null;
  state.connectDragState = null;

  if (typeof snapshot.theme === 'string' && typeof state.theme === 'string') {
    state.theme = snapshot.theme;
  }
}

function setStatus(root: HTMLElement, text: string, tone: 'idle' | 'busy' | 'good' | 'bad' = 'idle') {
  const status = root.querySelector<HTMLElement>('.github-save-dock__status');
  if (!status) return;

  status.textContent = text;
  status.dataset.tone = tone;
}

async function readResponseJson(response: Response) {
  return response.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

async function fetchSnapshot() {
  const response = await fetch('/api/canvas', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const payload = await readResponseJson(response);

  if (!response.ok) {
    throw new Error(String(payload?.error || `Canvas load failed with ${response.status}`));
  }

  return payload;
}

async function persistSnapshot(snapshot: DotSnapshot, token?: string | null) {
  const response = await fetch('/api/canvas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Dot-Save-Token': token } : {}),
    },
    body: JSON.stringify({ snapshot }),
  });
  const payload = await readResponseJson(response);

  if (!response.ok) {
    const error = new Error(String(payload?.error || `Canvas save failed with ${response.status}`));
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return payload;
}

function getStoredSaveToken() {
  try {
    return localStorage.getItem(SAVE_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function storeSaveToken(token: string) {
  try {
    if (token) localStorage.setItem(SAVE_TOKEN_STORAGE_KEY, token);
  } catch {
    // Non-critical; saving still works for this click.
  }
}

function createDock() {
  const dock = document.createElement('div');
  dock.className = 'github-save-dock';
  dock.innerHTML = `
    <button class="github-save-dock__button" type="button" data-action="save">save github</button>
    <button class="github-save-dock__button" type="button" data-action="load">load</button>
    <span class="github-save-dock__status" data-tone="idle">not saved</span>
  `;
  document.body.appendChild(dock);
  return dock;
}

export function installCanvasPersistence(rootInstance: unknown) {
  const state = getSetupState(rootInstance);
  if (!state) {
    console.warn('[dot:canvas] setup state unavailable; canvas persistence dock disabled');
    return;
  }

  const dock = createDock();

  async function loadFromGitHub(manual: boolean) {
    try {
      setStatus(dock, manual ? 'loading…' : 'checking…', 'busy');
      const payload = await fetchSnapshot();
      const snapshot = payload?.snapshot;

      if (!isSnapshot(snapshot)) {
        setStatus(dock, 'no snapshot yet', 'idle');
        return;
      }

      const currentArtifacts = arrayValue<Artifact>(state.artifacts);
      if (manual && currentArtifacts.length && !confirm('Load saved GitHub canvas and replace the current canvas?')) {
        setStatus(dock, 'load cancelled', 'idle');
        return;
      }

      if (!manual && currentArtifacts.length) {
        setStatus(dock, 'local canvas active', 'idle');
        return;
      }

      applySnapshot(state, snapshot);
      setStatus(dock, `loaded ${snapshot.artifacts.length}`, 'good');
    } catch (error) {
      console.warn('[dot:canvas] load failed', error);
      setStatus(dock, error instanceof Error ? error.message : 'load failed', 'bad');
    }
  }

  async function saveToGitHub() {
    try {
      const snapshot = buildSnapshot(state);
      setStatus(dock, 'saving…', 'busy');

      try {
        const payload = await persistSnapshot(snapshot, getStoredSaveToken());
        setStatus(dock, `saved ${snapshot.artifacts.length}`, 'good');
        console.info('[dot:canvas] saved snapshot', payload);
      } catch (error) {
        const status = (error as Error & { status?: number }).status;
        if (status !== 401) throw error;

        const token = prompt('DOT_SAVE_TOKEN for saving this canvas:')?.trim();
        if (!token) {
          setStatus(dock, 'save needs token', 'bad');
          return;
        }

        storeSaveToken(token);
        const payload = await persistSnapshot(snapshot, token);
        setStatus(dock, `saved ${snapshot.artifacts.length}`, 'good');
        console.info('[dot:canvas] saved snapshot', payload);
      }
    } catch (error) {
      console.warn('[dot:canvas] save failed', error);
      setStatus(dock, error instanceof Error ? error.message : 'save failed', 'bad');
    }
  }

  dock.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const action = target?.closest<HTMLButtonElement>('button')?.dataset.action;

    if (action === 'save') void saveToGitHub();
    if (action === 'load') void loadFromGitHub(true);
  });

  window.setTimeout(() => {
    void loadFromGitHub(false);
  }, 250);
}
