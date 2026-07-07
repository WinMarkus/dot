type Point = { x: number; y: number };
type CameraState = { x: number; y: number; zoom: number };
type DotSetupState = Record<string, unknown>;

type StoredArtifact = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  parentId?: string;
  title?: string;
};

type StoredConnection = {
  id: string;
  fromId: string;
  toId: string;
  meaning: string;
  createdAt: string;
};

function getSetupState(rootInstance: unknown): DotSetupState | null {
  const instance = rootInstance as { $?: { setupState?: DotSetupState } } | null;
  return instance?.$?.setupState ?? null;
}

function getArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getCamera(state: DotSetupState): CameraState {
  const camera = state.camera as Partial<CameraState> | null;
  return {
    x: Number.isFinite(camera?.x) ? Number(camera?.x) : 0,
    y: Number.isFinite(camera?.y) ? Number(camera?.y) : 0,
    zoom: Number.isFinite(camera?.zoom) ? Number(camera?.zoom) : 1,
  };
}

function worldToScreen(point: Point, camera: CameraState): Point {
  return {
    x: point.x * camera.zoom + camera.x,
    y: point.y * camera.zoom + camera.y,
  };
}

function nowLabel() {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());
}

function artifactCenter(artifact: StoredArtifact): Point {
  return {
    x: artifact.x + (artifact.width ?? 320) / 2,
    y: artifact.y + (artifact.height ?? 230) / 2,
  };
}

function hasConnection(connections: StoredConnection[], fromId: string, toId: string) {
  return connections.some((connection) => connection.fromId === fromId && connection.toId === toId);
}

function installReverseConnection(state: DotSetupState, connection: StoredConnection) {
  const connections = getArray<StoredConnection>(state.connections);
  if (hasConnection(connections, connection.toId, connection.fromId)) return;

  connections.push({
    id: crypto.randomUUID(),
    fromId: connection.toId,
    toId: connection.fromId,
    meaning: 'answers back',
    createdAt: nowLabel(),
  });

  state.connections = connections;
  const stale = getArray<string>(state.staleArtifactIds);
  if (!stale.includes(connection.fromId)) state.staleArtifactIds = [...stale, connection.fromId];
}

function renderTools(state: DotSetupState, root: HTMLElement) {
  const artifacts = getArray<StoredArtifact>(state.artifacts).filter((artifact) => !artifact.parentId);
  const connections = getArray<StoredConnection>(state.connections);
  const camera = getCamera(state);
  const artifactById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));

  root.replaceChildren();

  connections.forEach((connection) => {
    const from = artifactById.get(connection.fromId);
    const to = artifactById.get(connection.toId);
    if (!from || !to) return;

    const fromCenter = artifactCenter(from);
    const toCenter = artifactCenter(to);
    const mid = worldToScreen(
      {
        x: (fromCenter.x + toCenter.x) / 2,
        y: (fromCenter.y + toCenter.y) / 2,
      },
      camera,
    );
    const reversed = hasConnection(connections, connection.toId, connection.fromId);

    const group = document.createElement('div');
    group.className = 'connection-tool';
    group.style.left = `${mid.x}px`;
    group.style.top = `${mid.y}px`;

    const reverse = document.createElement('button');
    reverse.type = 'button';
    reverse.className = 'connection-tool__reverse';
    reverse.textContent = reversed ? '↔' : '↩';
    reverse.title = reversed ? 'Connection already works both ways' : 'Create reverse connection';
    reverse.disabled = reversed;
    reverse.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    reverse.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      installReverseConnection(state, connection);
    });

    group.appendChild(reverse);
    root.appendChild(group);
  });
}

export function installConnectionTools(rootInstance: unknown) {
  const state = getSetupState(rootInstance);
  if (!state) {
    console.warn('[dot:connections] setup state unavailable; connection tools disabled');
    return;
  }

  const root = document.createElement('div');
  root.className = 'connection-tools-layer';
  document.body.appendChild(root);

  let raf = 0;
  const tick = () => {
    renderTools(state, root);
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  window.addEventListener('beforeunload', () => cancelAnimationFrame(raf), { once: true });
}
