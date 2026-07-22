<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { generateArtifactsWithAi, generateImageWithAi, nameConnection, suggestGroupActions, suggestNextArtifacts } from './ai-client';
import type { ArtifactSuggestion } from './ai-client';
import type { ArtifactConnection, ConnectedInput } from './types';
import { createArtifactFromGenerated, cloneArtifact, fakeGenerateArtifact, nowLabel } from './artifact-factory';
import {
  canNestArtifact as canNestArtifactInTree,
  getArtifactRenderHeight as getArtifactTreeRenderHeight,
  getChildArtifacts as getTreeChildArtifacts,
  getParentArtifact as getTreeParentArtifact,
} from './artifact-tree';
import { ARTIFACT_HEIGHT, ARTIFACT_WIDTH, DELETE_TRANSITION_MS, MIN_ZOOM } from './constants';
import { DotComponentHost } from './component-host';
import { createComponentSrcDoc } from './component-srcdoc';
import { chooseConnectionBinding, connectionPortLabel, isDeclaredOutput, readArtifactOutput } from './connection-contract';
import {
  centerCameraOn as createCenteredCamera,
  clamp,
  getViewportSafeWorldPoint,
  screenToWorld as convertScreenToWorld,
  worldToScreen as convertWorldToScreen,
  zoomCameraAt,
} from './geometry';
import { fetchModelCatalog, formatModelPrice, loadSavedModel, saveModel, shortModelName } from './model-picker';
import type { ModelCatalog } from './model-picker';
import { isSerializableValue, LivingRuntime, livingPortKey } from './living-runtime';
import type { LivingPacket, LivingRuntimeSnapshot, SerializableValue } from './living-runtime';
import type { Artifact, ArtifactPortType, CameraState, DeletedMarker, DragState, GeneratedArtifact, GroupAction, Point, PromptMode, Viewport } from './types';

const FORK_SPLIT_MS = 840;

const dot = ref<Point>({ x: 0, y: 0 });
const camera = ref<CameraState>({ x: 0, y: 0, zoom: 1 });
const isDotActive = ref(false);
const isGenerating = ref(false);
const regeneratingArtifactId = ref<string | null>(null);
const prompt = ref('');
const promptMode = ref<PromptMode>({ type: 'create' });
const promptInput = ref<HTMLInputElement | null>(null);
const inspectorPanel = ref<HTMLElement | null>(null);
const inspectorEditPrompt = ref('');
const THEMES = ['nature', 'technical', 'space'] as const;
type ThemeName = (typeof THEMES)[number];

function loadSavedTheme(): ThemeName {
  try {
    const saved = localStorage.getItem('dot:theme');
    return THEMES.includes(saved as ThemeName) ? (saved as ThemeName) : 'nature';
  } catch {
    return 'nature';
  }
}

const theme = ref<ThemeName>(loadSavedTheme());

watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem('dot:theme', value);
    } catch {
      // Private mode: the theme still applies for this session.
    }
  },
  { immediate: true },
);

const generationStatus = ref<string | null>(null);
const modelCatalog = ref<ModelCatalog | null>(null);
const selectedTextModel = ref<string | null>(loadSavedModel('text'));
const selectedImageModel = ref<string | null>(loadSavedModel('image'));
const isModelPickerOpen = ref(false);

const currentTextModelId = computed(() => selectedTextModel.value ?? modelCatalog.value?.defaults.text ?? null);
const currentImageModelId = computed(() => selectedImageModel.value ?? modelCatalog.value?.defaults.image ?? null);

const statusLabel = computed(() => {
  if (generationStatus.value) return generationStatus.value;
  return currentTextModelId.value ? `ai · ${shortModelName(currentTextModelId.value)}` : 'ai models';
});

function toggleModelPicker() {
  isModelPickerOpen.value = !isModelPickerOpen.value;
}

function selectTextModel(id: string) {
  selectedTextModel.value = id;
  saveModel('text', id);
  generationStatus.value = null;
}

function selectImageModel(id: string) {
  selectedImageModel.value = id;
  saveModel('image', id);
}

function handleGlobalPointerDownForPicker(event: PointerEvent) {
  if (!isModelPickerOpen.value) return;
  const target = event.target as HTMLElement | null;
  if (!target?.closest('.model-dock')) isModelPickerOpen.value = false;
}

const artifacts = ref<Artifact[]>([]);
const deletingArtifactIds = ref<string[]>([]);
const deletedMarkers = ref<DeletedMarker[]>([]);
const splittingArtifactIds = ref<string[]>([]);
const forkBornArtifactIds = ref<string[]>([]);
const deletionTimers = new Map<string, number>();
const forkAnimationTimers = new Map<string, number>();

const selectedArtifactId = ref<string | null>(null);
const activeActionArtifactId = ref<string | null>(null);
const inspectedArtifactId = ref<string | null>(null);
const dropTargetArtifactId = ref<string | null>(null);

const dotDragState = ref<DragState | null>(null);
const artifactDragState = ref<(DragState & { artifactId: string }) | null>(null);
const deletedMarkerDragState = ref<(DragState & { markerId: string }) | null>(null);
const inspectorDragState = ref<DragState | null>(null);
const inspectorPosition = ref<Point | null>(null);
const panState = ref<DragState | null>(null);

type LassoState = {
  pointerId: number;
  startCamera: CameraState;
  startPoint: Point;
  points: Point[];
  armed: boolean;
  hasMoved: boolean;
};

type Constellation = {
  artifactIds: string[];
  center: Point;
  radius: number;
};

const lassoState = ref<LassoState | null>(null);
const constellation = ref<Constellation | null>(null);
const constellationActions = ref<GroupAction[]>([]);
const constellationActionsLoading = ref(false);
const creatingConstellationActionId = ref<string | null>(null);
const queuedConstellationActionIds = ref<string[]>([]);
const isCustomConstellationPromptOpen = ref(false);
const customConstellationPrompt = ref('');
const customConstellationPromptInput = ref<HTMLInputElement | null>(null);
let lassoArmTimer: number | null = null;
let constellationActionRequestToken = 0;

const dotClass = computed(() => ({
  'seed-dot--active': isDotActive.value,
  'seed-dot--generating': isGenerating.value,
  'seed-dot--dragging': Boolean(dotDragState.value),
}));

const worldTransform = computed(() => ({
  transform: `translate3d(${camera.value.x}px, ${camera.value.y}px, 0) scale(${camera.value.zoom})`,
}));

const gridStyle = computed(() => ({
  backgroundPosition: `${camera.value.x}px ${camera.value.y}px`,
  backgroundSize: `${44 * camera.value.zoom}px ${44 * camera.value.zoom}px`,
}));

const topLevelArtifacts = computed(() => artifacts.value.filter((artifact) => !artifact.parentId));

const promptPlaceholder = computed(() =>
  promptMode.value.type === 'edit' ? 'what should change about this?' : 'what do we want to build today?',
);

const promptActionLabel = computed(() => {
  if (promptMode.value.type === 'edit') {
    if (regeneratingArtifactId.value) return 'regenerating';
    if (isGenerating.value) return 'changing';
    return prompt.value.trim() ? 'change' : 'regenerate';
  }

  return isGenerating.value ? 'creating' : 'create';
});

const inspectorEditActionLabel = computed(() => {
  if (regeneratingArtifactId.value) return 'regenerating';
  if (isGenerating.value) return 'changing';
  return inspectorEditPrompt.value.trim() ? 'change' : 'regenerate';
});

const isPromptSubmitDisabled = computed(() => {
  if (isGenerating.value || regeneratingArtifactId.value) return true;
  if (promptMode.value.type === 'create') return !prompt.value.trim();
  return false;
});

const isInspectorEditDisabled = computed(() => isGenerating.value || Boolean(regeneratingArtifactId.value));

const inspectedArtifact = computed(() =>
  artifacts.value.find((artifact) => artifact.id === inspectedArtifactId.value) ?? null,
);

const inspectedArtifactRaw = computed(() =>
  inspectedArtifact.value ? JSON.stringify(inspectedArtifact.value.content, null, 2) : '',
);

const inspectorStyle = computed(() => {
  if (!inspectorPosition.value) return {};

  return {
    left: `${inspectorPosition.value.x}px`,
    top: `${inspectorPosition.value.y}px`,
    right: 'auto',
  };
});

function getViewport(): Viewport {
  return { width: window.innerWidth, height: window.innerHeight };
}

function screenToWorld(point: Point): Point {
  return convertScreenToWorld(point, camera.value);
}

function worldToScreen(point: Point): Point {
  return convertWorldToScreen(point, camera.value);
}

function getChildArtifacts(parentId: string) {
  return getTreeChildArtifacts(artifacts.value, parentId);
}

function getParentArtifact(artifact: Artifact) {
  return getTreeParentArtifact(artifacts.value, artifact);
}

function getArtifactRenderHeight(artifact: Artifact) {
  return getArtifactTreeRenderHeight(artifacts.value, artifact);
}

function canNestArtifact(child: Artifact, parent: Artifact) {
  return canNestArtifactInTree(artifacts.value, deletingArtifactIds.value, child, parent);
}

function resetCamera() {
  camera.value = createCenteredCamera(dot.value, getViewport(), 1);
}

function zoomAt(screenPoint: Point, nextZoom: number) {
  camera.value = zoomCameraAt(screenPoint, nextZoom, camera.value);
}

function clampInspectorPosition(position: Point): Point {
  const viewport = getViewport();
  const rect = inspectorPanel.value?.getBoundingClientRect();
  const width = rect?.width ?? Math.min(380, viewport.width - 36);
  const height = Math.min(rect?.height ?? 520, viewport.height - 24);
  const margin = 12;

  return {
    x: clamp(position.x, margin, Math.max(margin, viewport.width - width - margin)),
    y: clamp(position.y, margin, Math.max(margin, viewport.height - height - margin)),
  };
}

function chooseArtifactPosition(seed: Point) {
  const viewport = getViewport();
  const margin = 28;
  const reservedBottom = 132;
  const newArtifactSize = { w: 430, h: Math.max(285, ARTIFACT_HEIGHT) };
  const goldenAngle = (137.508 * Math.PI) / 180;
  const candidates = Array.from({ length: 30 }, (_, index) => {
    const ring = Math.floor(index / 6);
    const radius = 210 + ring * 104;
    const angle = (16 * Math.PI) / 180 + index * goldenAngle;
    return {
      x: seed.x + Math.cos(angle) * radius - newArtifactSize.w / 2,
      y: seed.y + Math.sin(angle) * radius - newArtifactSize.h / 2,
    };
  });

  const overlapsExistingBubble = (candidate: Point) => {
    const padding = 30;
    return topLevelArtifacts.value.some((artifact) => {
      // Placement plans for the steady state: the previous selection folds
      // back into its resting bubble when the new growth becomes selected.
      const size = closedArtifactSize(artifact);
      return !(
        candidate.x + newArtifactSize.w + padding <= artifact.x ||
        candidate.x >= artifact.x + size.w + padding ||
        candidate.y + newArtifactSize.h + padding <= artifact.y ||
        candidate.y >= artifact.y + size.h + padding
      );
    });
  };

  const fittingCandidate = candidates.find((candidate) => {
    const screen = worldToScreen(candidate);
    const width = newArtifactSize.w * camera.value.zoom;
    const height = newArtifactSize.h * camera.value.zoom;

    return (
      !overlapsExistingBubble(candidate) &&
      screen.x >= margin &&
      screen.y >= margin &&
      screen.x + width <= viewport.width - margin &&
      screen.y + height <= viewport.height - reservedBottom
    );
  });

  return (
    fittingCandidate ??
    candidates.find((candidate) => !overlapsExistingBubble(candidate)) ??
    getViewportSafeWorldPoint({ x: margin, y: margin + 24 }, camera.value, viewport)
  );
}

function activatePrompt() {
  if (isGenerating.value || regeneratingArtifactId.value) return;
  isDotActive.value = true;
  nextTick(() => promptInput.value?.focus());
}

function resetPromptMode() {
  promptMode.value = { type: 'create' };
  prompt.value = '';
}

function closeTransientUi() {
  dismissConstellation();
  clearQueuedSuggestions();
  selectedArtifactId.value = null;
  activeActionArtifactId.value = null;
  inspectedArtifactId.value = null;
  dropTargetArtifactId.value = null;
  inspectorEditPrompt.value = '';

  if (!isGenerating.value && !regeneratingArtifactId.value) {
    isDotActive.value = false;
    resetPromptMode();
  }
}

function isWorkspaceGestureTarget(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;

  return !target.closest(
    '.artifact-card, .seed-dot, .command-bar, .canvas-help, .inspector-panel, .deleted-marker, .marker-control, .nested-bubbles, .constellation-action, .constellation-custom-prompt',
  );
}

function openPromptAtScreenPoint(point: Point) {
  if (isGenerating.value || regeneratingArtifactId.value) return;

  selectedArtifactId.value = null;
  activeActionArtifactId.value = null;
  inspectedArtifactId.value = null;
  dropTargetArtifactId.value = null;
  inspectorEditPrompt.value = '';
  dot.value = screenToWorld(point);
  resetPromptMode();
  activatePrompt();
}

function pushUniqueId(target: typeof splittingArtifactIds, id: string) {
  if (!target.value.includes(id)) {
    target.value.push(id);
  }
}

function removeId(target: typeof splittingArtifactIds, id: string) {
  target.value = target.value.filter((item) => item !== id);
}

function animateForkSplit(sourceId: string, forkId: string) {
  pushUniqueId(splittingArtifactIds, sourceId);
  pushUniqueId(forkBornArtifactIds, forkId);

  const timerId = window.setTimeout(() => {
    removeId(splittingArtifactIds, sourceId);
    removeId(forkBornArtifactIds, forkId);
    forkAnimationTimers.delete(forkId);
  }, FORK_SPLIT_MS);

  forkAnimationTimers.set(forkId, timerId);
}

function addGenerationMeta(generated: GeneratedArtifact, provider?: string, model?: string): GeneratedArtifact {
  return {
    ...generated,
    content: {
      ...generated.content,
      provider,
      model,
    },
    children: generated.children?.map((child) => addGenerationMeta(child, provider, model)) ?? [],
  };
}

function createCanvasContext() {
  return {
    artifacts: artifacts.value.map((artifact) => ({
      id: artifact.id,
      kind: artifact.kind,
      title: artifact.title,
      prompt: artifact.prompt,
      parentId: artifact.parentId ?? null,
      purpose: artifact.content.purpose ?? '',
      summary: artifact.content.summary ?? '',
      ports: artifact.content.ports ?? { inputs: [], outputs: [] },
    })),
  };
}

async function requestGeneratedArtifacts(
  value: string,
  mode: 'create' | 'edit' | 'regenerate',
  selectedArtifact?: Artifact,
  preferredKind?: ArtifactSuggestion['kind'],
  connectedInputs?: ConnectedInput[],
) {
  const effectivePrompt = value || selectedArtifact?.prompt || selectedArtifact?.title || 'Regenerate artifact';

  try {
    const result = await generateArtifactsWithAi({
      prompt: effectivePrompt,
      mode,
      model: selectedTextModel.value,
      preferredKind: preferredKind ?? null,
      selectedArtifact: selectedArtifact ?? null,
      connectedInputs: connectedInputs ?? (selectedArtifact ? buildConnectedInputs(selectedArtifact.id) : []),
      canvasContext: createCanvasContext(),
    });

    generationStatus.value = result.model ? `ai · ${result.model}` : 'ai';
    return result.artifacts.map((artifact) => addGenerationMeta(artifact, result.provider, result.model));
  } catch (error) {
    console.warn('AI generation failed. Falling back to local generator.', error);
    generationStatus.value = 'dreaming offline';
    return [fakeGenerateArtifact(effectivePrompt, selectedArtifact, preferredKind)];
  }
}

// Always resolve through artifacts.value so we mutate the reactive proxy —
// a raw pre-push reference would update silently without re-rendering.
function findLiveArtifact(artifactId: string) {
  return artifacts.value.find((item) => item.id === artifactId) ?? null;
}

const connections = ref<ArtifactConnection[]>([]);
const staleArtifactIds = ref<string[]>([]);
const pulsingConnectionIds = ref<string[]>([]);
const componentRuntimeErrors = ref<Record<string, string>>({});
const connectDragState = ref<{ pointerId: number; fromId: string; toWorld: Point; hoverTargetId: string | null } | null>(null);
const weaveSourceId = ref<string | null>(null);
const connectionPulseTimers = new Map<string, number>();
let componentHost: DotComponentHost | null = null;
let suppressNextAuraClick = false;

function ensureArtifactRuntime(artifact: Artifact) {
  if (!artifact.runtime) artifact.runtime = { inputs: {}, outputs: {}, revision: 0 };
  return artifact.runtime;
}

function componentInputSnapshot(artifactId: string) {
  const artifact = findLiveArtifact(artifactId);
  const runtime = artifact ? ensureArtifactRuntime(artifact) : null;
  return { inputs: runtime?.inputs ?? {}, revision: runtime?.revision ?? 0 };
}

function setComponentRuntimeError(artifactId: string, message?: string) {
  const next = { ...componentRuntimeErrors.value };
  if (message) next[artifactId] = message;
  else delete next[artifactId];
  componentRuntimeErrors.value = next;
}

function artifactRuntimeIssue(artifactId: string) {
  return componentRuntimeErrors.value[artifactId] ?? connections.value.find((connection) => connection.toId === artifactId && connection.error)?.error;
}

const livingRuntime = new LivingRuntime({
  onError: ({ error, connectionId }) => {
    console.warn('[dot:living-runtime]', connectionId ?? 'runtime', error);
  },
});

type RuntimePortRegistration = {
  signature: string;
  dispose: () => void;
};

type RuntimeConnectionRegistration = {
  signature: string;
  toArtifactId: string;
  toPortId: string;
};

const runtimePortRegistrations = new Map<string, RuntimePortRegistration>();
const runtimeConnectionRegistrations = new Map<string, RuntimeConnectionRegistration>();
const mirroredConnectionRevisions = new Map<string, number>();

function runtimePortAddress(artifactId: string, portId: string, direction: 'input' | 'output') {
  return { artifactId, portId: `${direction}:${portId}` };
}

function cloneSerializable(value: unknown): SerializableValue | undefined {
  try {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) return undefined;
    const clone = JSON.parse(encoded) as unknown;
    return isSerializableValue(clone) ? clone : undefined;
  } catch {
    return undefined;
  }
}

function receiveLivingInput(artifactId: string, portId: string, packet: LivingPacket) {
  const artifact = findLiveArtifact(artifactId);
  if (!artifact) return;

  const runtime = ensureArtifactRuntime(artifact);
  runtime.inputs = { ...runtime.inputs, [portId]: structuredClone(packet.value) };
  runtime.revision += 1;
  runtime.updatedAt = new Date(packet.deliveredAt ?? Date.now()).toISOString();
  componentHost?.sendInputs(artifactId, runtime.inputs, runtime.revision);
}

function clearUnboundInput(artifactId: string, portId: string) {
  const stillBound = connections.value.some(
    (connection) => connection.toId === artifactId && connection.toPortId === portId && connection.fromPortId,
  );
  if (stillBound) return;

  const artifact = findLiveArtifact(artifactId);
  if (!artifact?.runtime || !Object.prototype.hasOwnProperty.call(artifact.runtime.inputs, portId)) return;
  const { [portId]: _removed, ...remaining } = artifact.runtime.inputs;
  artifact.runtime.inputs = remaining;
  artifact.runtime.revision += 1;
  componentHost?.sendInputs(artifactId, remaining, artifact.runtime.revision);
}

function syncLivingRuntime() {
  // Saved canvases and future import paths may bypass createConnection(). Keep
  // the executable graph acyclic here too: one edge in every automatic
  // feedback loop becomes a deliberate, user-released breathe boundary.
  for (const connection of connections.value) {
    if ((connection.policy ?? 'breathe') === 'breathe') continue;
    if (!wouldCloseAutomaticConnectionCycle(connection.fromId, connection.toId)) continue;
    connection.policy = 'breathe';
    markStale(connection.toId);
  }

  const desiredPorts = new Map<
    string,
    { artifactId: string; portId: string; direction: 'input' | 'output'; type: ArtifactPortType; signature: string }
  >();

  for (const artifact of artifacts.value) {
    for (const direction of ['input', 'output'] as const) {
      const ports = direction === 'input' ? artifact.content.ports?.inputs ?? [] : artifact.content.ports?.outputs ?? [];
      for (const port of ports) {
        const address = runtimePortAddress(artifact.id, port.id, direction);
        const key = livingPortKey(address);
        desiredPorts.set(key, {
          artifactId: artifact.id,
          portId: port.id,
          direction,
          type: port.type,
          signature: `${direction}:${port.type}:${port.mode ?? 'state'}`,
        });
      }
    }
  }

  const newlyConnected: ArtifactConnection[] = [];
  livingRuntime.batch(() => {
    for (const [key, registration] of runtimePortRegistrations) {
      const desired = desiredPorts.get(key);
      if (desired?.signature === registration.signature) continue;
      registration.dispose();
      runtimePortRegistrations.delete(key);
    }

    for (const [key, desired] of desiredPorts) {
      if (runtimePortRegistrations.has(key)) continue;
      const address = runtimePortAddress(desired.artifactId, desired.portId, desired.direction);
      const disposePort = livingRuntime.registerPort({ ...address, direction: desired.direction, type: desired.type });
      const disposeInput =
        desired.direction === 'input'
          ? livingRuntime.subscribeInput(address, (packet) => receiveLivingInput(desired.artifactId, desired.portId, packet))
          : () => {};
      runtimePortRegistrations.set(key, {
        signature: desired.signature,
        dispose: () => {
          disposeInput();
          disposePort();
        },
      });
    }

    const desiredConnectionIds = new Set(
      connections.value
        .filter((connection) => connection.fromPortId && connection.toPortId)
        .map((connection) => connection.id),
    );

    for (const [id, registration] of runtimeConnectionRegistrations) {
      if (desiredConnectionIds.has(id)) continue;
      livingRuntime.disconnect(id);
      runtimeConnectionRegistrations.delete(id);
      mirroredConnectionRevisions.delete(id);
      clearUnboundInput(registration.toArtifactId, registration.toPortId);
    }

    for (const connection of connections.value) {
      if (!connection.fromPortId || !connection.toPortId) continue;
      const signature = [
        connection.fromId,
        connection.fromPortId,
        connection.toId,
        connection.toPortId,
        connection.policy ?? 'breathe',
      ].join(':');
      const existing = runtimeConnectionRegistrations.get(connection.id);
      if (existing?.signature === signature) {
        const runtimeConnection = livingRuntime.getConnection(connection.id);
        if (runtimeConnection && runtimeConnection.meaning !== connection.meaning) {
          livingRuntime.updateConnection(connection.id, { meaning: connection.meaning });
        }
        continue;
      }
      if (existing) {
        livingRuntime.disconnect(connection.id);
        clearUnboundInput(existing.toArtifactId, existing.toPortId);
      }

      livingRuntime.connect({
        id: connection.id,
        from: runtimePortAddress(connection.fromId, connection.fromPortId, 'output'),
        to: runtimePortAddress(connection.toId, connection.toPortId, 'input'),
        meaning: connection.meaning,
        policy: connection.policy ?? 'breathe',
      });
      runtimeConnectionRegistrations.set(connection.id, {
        signature,
        toArtifactId: connection.toId,
        toPortId: connection.toPortId,
      });
      newlyConnected.push(connection);
    }
  });

  newlyConnected.forEach(publishConnectionSource);
}

function pulseLivingConnection(connectionId: string, duration = 1150) {
  if (!pulsingConnectionIds.value.includes(connectionId)) {
    pulsingConnectionIds.value = [...pulsingConnectionIds.value, connectionId];
  }
  const previous = connectionPulseTimers.get(connectionId);
  if (previous) window.clearTimeout(previous);
  connectionPulseTimers.set(
    connectionId,
    window.setTimeout(() => {
      pulsingConnectionIds.value = pulsingConnectionIds.value.filter((id) => id !== connectionId);
      connectionPulseTimers.delete(connectionId);
    }, duration),
  );
}

function mirrorLivingRuntime(snapshot: LivingRuntimeSnapshot) {
  for (const state of snapshot.connections) {
    const connection = connections.value.find((candidate) => candidate.id === state.id);
    if (!connection) continue;

    const previousRevision = mirroredConnectionRevisions.get(state.id) ?? 0;
    connection.status = state.status;
    connection.revision = state.revision;
    connection.error = state.blockedReason?.message;
    if (state.lastPacket?.deliveredAt) connection.lastFlowAt = new Date(state.lastPacket.deliveredAt).toISOString();
    if (state.revision > previousRevision) pulseLivingConnection(state.id);
    if (state.hasPending && state.policy === 'breathe') markStale(connection.toId);
    mirroredConnectionRevisions.set(state.id, state.revision);
  }
}

function publishArtifactOutput(artifact: Artifact, portId: string, value = readArtifactOutput(artifact, portId)) {
  const serializable = cloneSerializable(value);
  if (serializable === undefined) return;
  if (!livingRuntime.getPort(runtimePortAddress(artifact.id, portId, 'output'))) syncLivingRuntime();

  try {
    const packet = livingRuntime.emit(runtimePortAddress(artifact.id, portId, 'output'), serializable, {
      metadata: { artifactId: artifact.id, title: artifact.title },
    });
    const runtime = ensureArtifactRuntime(artifact);
    runtime.outputs = { ...runtime.outputs, [portId]: serializable };
    runtime.revision = Math.max(runtime.revision + 1, packet.revision);
    runtime.updatedAt = new Date(packet.emittedAt).toISOString();
    setComponentRuntimeError(artifact.id);
  } catch (error) {
    setComponentRuntimeError(artifact.id, error instanceof Error ? error.message : 'Could not emit this value.');
  }
}

function publishConnectionSource(connection: ArtifactConnection) {
  if (!connection.fromPortId) return;
  const artifact = findLiveArtifact(connection.fromId);
  const port = artifact?.content.ports?.outputs.find((candidate) => candidate.id === connection.fromPortId);
  if (!artifact || !port || port.mode === 'event' || port.type === 'event') return;
  if (artifact.kind === 'component' && artifact.runtime?.outputs[port.id] === undefined) return;
  publishArtifactOutput(artifact, port.id);
}

function publishArtifactOutputs(artifact: Artifact) {
  for (const port of artifact.content.ports?.outputs ?? []) {
    if (port.mode === 'event') continue;
    publishArtifactOutput(artifact, port.id);
  }
}

function handleComponentEmit(artifactId: string, portId: string, value: unknown) {
  const artifact = findLiveArtifact(artifactId);
  if (!artifact) return;
  if (!isDeclaredOutput(artifact, portId)) {
    setComponentRuntimeError(artifactId, `The component emitted undeclared output “${portId}”.`);
    return;
  }

  const serializable = cloneSerializable(value);
  if (serializable === undefined || JSON.stringify(serializable).length > 256_000) {
    setComponentRuntimeError(artifactId, `Output “${portId}” must be a compact JSON-serializable value.`);
    return;
  }
  publishArtifactOutput(artifact, portId, serializable);
}

const stopLivingRuntimeSubscription = livingRuntime.subscribe(mirrorLivingRuntime);

const livingTopologySignature = computed(() =>
  JSON.stringify({
    artifacts: artifacts.value.map((artifact) => ({
      id: artifact.id,
      inputs: artifact.content.ports?.inputs.map((port) => [port.id, port.type, port.mode]) ?? [],
      outputs: artifact.content.ports?.outputs.map((port) => [port.id, port.type, port.mode]) ?? [],
    })),
    connections: connections.value.map((connection) => [
      connection.id,
      connection.fromId,
      connection.fromPortId,
      connection.toId,
      connection.toPortId,
      connection.policy,
      connection.meaning,
    ]),
  }),
);

watch(livingTopologySignature, syncLivingRuntime, { immediate: true });

type ArtifactSize = { w: number; h: number };
type ArtifactMeasurement = {
  id: string;
  layout: ArtifactSize;
  scale: { x: number; y: number };
};

const ORGANIC_BUBBLE_SHAPES = [
  { closed: '47% 53% 49% 51% / 45% 48% 52% 55%', open: '45% 55% 48% 52% / 43% 47% 53% 57%' },
  { closed: '54% 46% 51% 49% / 48% 54% 46% 52%', open: '53% 47% 55% 45% / 46% 53% 47% 54%' },
  { closed: '50% 50% 44% 56% / 55% 44% 56% 45%', open: '49% 51% 43% 57% / 54% 43% 57% 46%' },
  { closed: '45% 55% 54% 46% / 52% 47% 53% 48%', open: '43% 57% 53% 47% / 50% 46% 54% 50%' },
  { closed: '52% 48% 46% 54% / 44% 55% 45% 56%', open: '51% 49% 45% 55% / 42% 54% 46% 58%' },
] as const;

const artifactCardElements = new Map<string, HTMLElement>();
const selectedArtifactMeasurement = ref<ArtifactMeasurement | null>(null);
let selectedCardResizeObserver: ResizeObserver | null = null;

function closedArtifactSize(artifact: Artifact): ArtifactSize {
  const growth = Math.min(getChildArtifacts(artifact.id).length, 5) * 9;
  const base = 148 + growth;
  const hash = Math.abs(idHash(artifact.id));
  return { w: base + (hash % 19) - 9, h: base + (Math.floor(hash / 19) % 17) - 8 };
}

function selectedArtifactFallbackSize(artifact: Artifact): ArtifactSize {
  return { w: 430, h: Math.max(285, getArtifactRenderHeight(artifact)) };
}

function artifactLayoutSize(artifact: Artifact): ArtifactSize {
  const measurement = selectedArtifactMeasurement.value;
  if (selectedArtifactId.value === artifact.id && measurement?.id === artifact.id) return measurement.layout;
  if (selectedArtifactId.value === artifact.id) return selectedArtifactFallbackSize(artifact);
  return closedArtifactSize(artifact);
}

function artifactRenderedBounds(artifact: Artifact) {
  const layout = artifactLayoutSize(artifact);
  const measurement = selectedArtifactMeasurement.value;
  const scale = selectedArtifactId.value === artifact.id && measurement?.id === artifact.id ? measurement.scale : { x: 1, y: 1 };
  const w = layout.w * scale.x;
  const h = layout.h * scale.y;
  return { x: artifact.x + (layout.w - w) / 2, y: artifact.y + (layout.h - h) / 2, w, h };
}

function artifactCenter(artifact: Artifact): Point {
  const bounds = artifactRenderedBounds(artifact);
  return { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
}

function artifactOrganicStyle(artifact: Artifact) {
  const size = closedArtifactSize(artifact);
  const shape = ORGANIC_BUBBLE_SHAPES[Math.abs(idHash(artifact.id)) % ORGANIC_BUBBLE_SHAPES.length];
  return {
    '--closed-bubble-width': `${size.w}px`,
    '--closed-bubble-height': `${size.h}px`,
    '--bubble-radius-closed': shape.closed,
    '--bubble-radius-open': shape.open,
    '--bubble-drift-delay': `${Math.abs(idHash(`${artifact.id}:drift`)) % 6400}ms`,
  };
}

function setArtifactCardElement(artifactId: string, element: Element | null) {
  if (element instanceof HTMLElement) artifactCardElements.set(artifactId, element);
  else artifactCardElements.delete(artifactId);
}

function getRenderedScale(element: HTMLElement) {
  const match = getComputedStyle(element).transform.match(/^matrix\(([^)]+)\)$/);
  if (!match) return { x: 1, y: 1 };
  const values = match[1].split(',').map(Number);
  if (values.length < 4 || values.some((value) => Number.isNaN(value))) return { x: 1, y: 1 };
  return { x: Math.hypot(values[0], values[1]), y: Math.hypot(values[2], values[3]) };
}

function syncSelectedArtifactMeasurement() {
  const artifact = selectedTopLevelArtifact.value;
  const element = artifact ? artifactCardElements.get(artifact.id) : null;
  selectedCardResizeObserver?.disconnect();

  if (!artifact || !element) {
    selectedArtifactMeasurement.value = null;
    return;
  }

  const sync = () => {
    const next: ArtifactMeasurement = {
      id: artifact.id,
      layout: { w: element.offsetWidth, h: element.offsetHeight },
      scale: getRenderedScale(element),
    };
    const previous = selectedArtifactMeasurement.value;
    if (
      previous?.id !== next.id ||
      previous.layout.w !== next.layout.w ||
      previous.layout.h !== next.layout.h ||
      previous.scale.x !== next.scale.x ||
      previous.scale.y !== next.scale.y
    ) {
      selectedArtifactMeasurement.value = next;
    }
  };

  sync();
  selectedCardResizeObserver = new ResizeObserver(sync);
  selectedCardResizeObserver.observe(element);
}

// A slow shared clock that lets tendrils undulate and motes drift.
const tendrilPhase = ref(0);
let tendrilRaf = 0;

function animateTendrils(timestamp: number) {
  tendrilPhase.value = timestamp / 1000;
  tendrilRaf = requestAnimationFrame(animateTendrils);
}

function idHash(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return hash;
}

function cubicPoint(from: Point, controlA: Point, controlB: Point, to: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * from.x + 3 * u * u * t * controlA.x + 3 * u * t * t * controlB.x + t * t * t * to.x,
    y: u * u * u * from.y + 3 * u * u * t * controlA.y + 3 * u * t * t * controlB.y + t * t * t * to.y,
  };
}

function tendrilGeometry(from: Point, to: Point, id: string, phase: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const hash = idHash(id);
  const direction = { x: dx / length, y: dy / length };
  const perpendicular = { x: -direction.y, y: direction.x };
  const sign = hash % 2 === 0 ? 1 : -1;
  const rootBend = sign * (30 + (Math.abs(hash) % 54));
  const tipBend = -sign * (18 + (Math.floor(Math.abs(hash) / 7) % 48));
  const sway = Math.sin(phase * (0.38 + (Math.abs(hash) % 3) * 0.08) + (Math.abs(hash) % 41)) * Math.min(22, length / 11);
  const rootRun = length * (0.19 + (Math.abs(hash) % 13) / 100);
  const tipRun = length * (0.24 + (Math.floor(Math.abs(hash) / 11) % 15) / 100);
  const controlA = {
    x: from.x + direction.x * rootRun + perpendicular.x * (rootBend + sway),
    y: from.y + direction.y * rootRun + perpendicular.y * (rootBend + sway),
  };
  const controlB = {
    x: to.x - direction.x * tipRun + perpendicular.x * (tipBend - sway * 0.72),
    y: to.y - direction.y * tipRun + perpendicular.y * (tipBend - sway * 0.72),
  };

  return {
    controlA,
    controlB,
    path: `M ${from.x} ${from.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${to.x} ${to.y}`,
    mid: cubicPoint(from, controlA, controlB, to, 0.52),
  };
}

function tendrilMotes(from: Point, controlA: Point, controlB: Point, to: Point, id: string, phase: number, pulsing: boolean) {
  const hash = Math.abs(idHash(id));
  const count = pulsing ? 4 : 2;
  const speed = pulsing ? 0.34 : 0.085;

  const motes = [];
  for (let i = 0; i < count; i++) {
    const t = (phase * speed + i / count + (hash % 97) / 97) % 1;
    const point = cubicPoint(from, controlA, controlB, to, t);
    // Motes are born and fade at the ends, glowing brightest mid-journey.
    const life = Math.sin(t * Math.PI);
    motes.push({ key: `${id}-${i}`, x: point.x, y: point.y, opacity: 0.25 + life * 0.75, r: pulsing ? 3.2 : 2.4 });
  }
  return motes;
}

function tendrilAnchor(artifact: Artifact, toward: Point): Point {
  const bounds = artifactRenderedBounds(artifact);
  const center = { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const denominator = Math.max(Math.sqrt((dx / Math.max(bounds.w / 2, 1)) ** 2 + (dy / Math.max(bounds.h / 2, 1)) ** 2), 1);
  return { x: center.x + dx / denominator, y: center.y + dy / denominator };
}

const renderedConnections = computed(() =>
  connections.value.flatMap((connection) => {
    const from = findLiveArtifact(connection.fromId);
    const to = findLiveArtifact(connection.toId);
    if (!from || !to || from.parentId || to.parentId) return [];

    const fromCenter = artifactCenter(from);
    const toCenter = artifactCenter(to);
    const fromAnchor = tendrilAnchor(from, toCenter);
    const toAnchor = tendrilAnchor(to, fromCenter);
    const pulsing = pulsingConnectionIds.value.includes(connection.id);
    const geometry = tendrilGeometry(fromAnchor, toAnchor, connection.id, tendrilPhase.value);

    return [
      {
        connection,
        from: fromAnchor,
        to: toAnchor,
        path: geometry.path,
        mid: geometry.mid,
        pulsing,
        motes: tendrilMotes(fromAnchor, geometry.controlA, geometry.controlB, toAnchor, connection.id, tendrilPhase.value, pulsing),
      },
    ];
  }),
);

function connectionBindingLabel(connection: ArtifactConnection) {
  const from = findLiveArtifact(connection.fromId);
  const to = findLiveArtifact(connection.toId);
  if (!from || !to || !connection.fromPortId || !connection.toPortId) return 'generative context · breathe';
  return `${connectionPortLabel(from, connection.fromPortId)} → ${connectionPortLabel(to, connection.toPortId)} · ${connection.policy ?? 'breathe'}`;
}

// Motion is evidence: dormant relationships rest instead of burning a frame
// loop just to look alive. A drag or an actual value pulse wakes the organism.
watch(
  () => pulsingConnectionIds.value.length > 0 || Boolean(connectDragState.value),
  (alive) => {
    if (alive && !tendrilRaf) {
      tendrilRaf = requestAnimationFrame(animateTendrils);
    } else if (!alive && tendrilRaf) {
      cancelAnimationFrame(tendrilRaf);
      tendrilRaf = 0;
    }
  },
  { immediate: true },
);

const selectedTopLevelArtifact = computed(() => {
  const id = selectedArtifactId.value;
  if (!id) return null;
  const artifact = findLiveArtifact(id);
  return artifact && !artifact.parentId ? artifact : null;
});

const activeConstellationArtifacts = computed(() => {
  const selection = constellation.value;
  if (!selection) return [];
  return selection.artifactIds.map(findLiveArtifact).filter((artifact): artifact is Artifact => Boolean(artifact && !artifact.parentId));
});

const activeConstellation = computed(() => (activeConstellationArtifacts.value.length >= 2 ? constellation.value : null));

const lassoPath = computed(() => {
  const points = lassoState.value?.points ?? [];
  if (!lassoState.value?.armed || points.length < 2) return '';
  return `M ${points.map((point) => `${point.x} ${point.y}`).join(' L ')}`;
});

const lassoCandidateArtifactIds = computed(() => {
  const state = lassoState.value;
  if (!state?.armed || state.points.length < 3) return [];
  return topLevelArtifacts.value
    .filter((artifact) => pointIsInsidePolygon(convertWorldToScreen(artifactCenter(artifact), state.startCamera), state.points))
    .map((artifact) => artifact.id);
});

const queuedConstellationActions = computed(() =>
  constellationActions.value.filter((action) => queuedConstellationActionIds.value.includes(action.id)),
);

const constellationOrbitCount = computed(
  () => constellationActions.value.length + 1 + (queuedConstellationActions.value.length ? 1 : 0),
);

const selectedHaloBounds = computed(() => {
  const artifact = selectedTopLevelArtifact.value;
  if (!artifact) return null;
  const bounds = artifactRenderedBounds(artifact);
  const padding = 42;
  const shape = ORGANIC_BUBBLE_SHAPES[Math.abs(idHash(artifact.id)) % ORGANIC_BUBBLE_SHAPES.length];
  return { x: bounds.x - padding, y: bounds.y - padding, w: bounds.w + padding * 2, h: bounds.h + padding * 2, radius: shape.open };
});

const liveTendrilPath = computed(() => {
  const state = connectDragState.value;
  if (!state) return null;
  const from = findLiveArtifact(state.fromId);
  if (!from) return null;
  return tendrilGeometry(tendrilAnchor(from, state.toWorld), state.toWorld, state.fromId, tendrilPhase.value).path;
});

function connectedValueSnippet(value: unknown) {
  if (typeof value === 'string') return value.slice(0, 600);
  try {
    return JSON.stringify(value).slice(0, 600);
  } catch {
    return String(value).slice(0, 600);
  }
}

function artifactContentSnippet(artifact: Artifact, portId?: string) {
  return connectedValueSnippet(readArtifactOutput(artifact, portId));
}

function buildConnectedInputs(artifactId: string): ConnectedInput[] {
  return connections.value
    .filter((connection) => connection.toId === artifactId)
    .slice(0, 6)
    .flatMap((connection) => {
      const from = findLiveArtifact(connection.fromId);
      if (!from) return [];
      return [
        {
          meaning: connection.meaning,
          kind: from.kind,
          title: from.title,
          content: artifactContentSnippet(from, connection.fromPortId),
        },
      ];
    });
}

function markDownstreamStale(changedId: string) {
  const downstream = connections.value
    .filter((connection) => connection.fromId === changedId && (connection.policy ?? 'breathe') === 'breathe')
    .map((connection) => connection.toId)
    .filter((id) => id !== changedId && !staleArtifactIds.value.includes(id) && findLiveArtifact(id));

  if (downstream.length) staleArtifactIds.value = [...staleArtifactIds.value, ...downstream];
}

function markStale(artifactId: string) {
  if (!staleArtifactIds.value.includes(artifactId)) staleArtifactIds.value = [...staleArtifactIds.value, artifactId];
}

function clearStale(artifactId: string) {
  staleArtifactIds.value = staleArtifactIds.value.filter((id) => id !== artifactId);
}

function wouldCloseAutomaticConnectionCycle(fromId: string, toId: string) {
  const visited = new Set<string>();
  const frontier = [toId];

  while (frontier.length) {
    const current = frontier.pop();
    if (!current || visited.has(current)) continue;
    if (current === fromId) return true;
    visited.add(current);

    for (const connection of connections.value) {
      if (connection.fromId === current && (connection.policy ?? 'breathe') !== 'breathe') {
        frontier.push(connection.toId);
      }
    }
  }

  return false;
}

function forgetConnectionVisualState(connectionId: string) {
  const timer = connectionPulseTimers.get(connectionId);
  if (timer) window.clearTimeout(timer);
  connectionPulseTimers.delete(connectionId);
  pulsingConnectionIds.value = pulsingConnectionIds.value.filter((id) => id !== connectionId);
}

async function createConnection(fromId: string, toId: string, meaning?: string) {
  if (fromId === toId) return;
  if (connections.value.some((connection) => connection.fromId === fromId && connection.toId === toId)) return;

  const from = findLiveArtifact(fromId);
  const to = findLiveArtifact(toId);
  if (!from || !to) return;
  const binding = chooseConnectionBinding(from, to);
  const policy =
    binding.policy !== 'breathe' && wouldCloseAutomaticConnectionCycle(fromId, toId)
      ? 'breathe'
      : binding.policy;

  // Inputs represent one current value. A new weave to an occupied input
  // deliberately grafts over the older binding instead of leaving ambiguous,
  // order-dependent state behind.
  if (binding.toPort) {
    const displaced = connections.value.filter(
      (connection) => connection.toId === toId && connection.toPortId === binding.toPort?.id,
    );
    if (displaced.length) {
      const displacedIds = new Set(displaced.map((connection) => connection.id));
      connections.value = connections.value.filter((connection) => !displacedIds.has(connection.id));
      displaced.forEach((connection) => forgetConnectionVisualState(connection.id));
      syncLivingRuntime();
    }
  }

  const connection: ArtifactConnection = {
    id: crypto.randomUUID(),
    fromId,
    toId,
    fromPortId: binding.fromPort?.id,
    toPortId: binding.toPort?.id,
    policy,
    status: 'resting',
    revision: 0,
    meaning: meaning?.toLowerCase().slice(0, 60).trim() || 'weaving…',
    createdAt: nowLabel(),
  };
  connections.value.push(connection);

  // Deterministic components absorb compatible values immediately. Expensive
  // or generative receivers keep the existing invitation-to-breathe rhythm.
  if (policy === 'breathe') markStale(toId);
  syncLivingRuntime();

  if (!meaning) {
    const compact = (artifact: Artifact) => ({
      kind: artifact.kind,
      title: artifact.title,
      summary: artifact.content.summary ?? artifact.prompt,
    });

    try {
      const named = await nameConnection(compact(from), compact(to));
      const live = connections.value.find((item) => item.id === connection.id);
      if (live) live.meaning = named;
    } catch (error) {
      console.warn('Connection naming failed.', error);
      const live = connections.value.find((item) => item.id === connection.id);
      if (live) live.meaning = 'connected to';
    }
  }
}

function removeConnection(connectionId: string) {
  connections.value = connections.value.filter((connection) => connection.id !== connectionId);
  forgetConnectionVisualState(connectionId);
  syncLivingRuntime();
}

function findArtifactAtWorldPoint(point: Point, excludeId?: string) {
  return (
    topLevelArtifacts.value.find((candidate) => {
      if (candidate.id === excludeId) return false;
      const bounds = artifactRenderedBounds(candidate);
      return point.x >= bounds.x && point.x <= bounds.x + bounds.w && point.y >= bounds.y && point.y <= bounds.y + bounds.h;
    }) ?? null
  );
}

function handleAuraPointerDown(event: PointerEvent, artifact: Artifact) {
  event.stopPropagation();
  (event.currentTarget as Element).setPointerCapture(event.pointerId);

  connectDragState.value = {
    pointerId: event.pointerId,
    fromId: artifact.id,
    toWorld: screenToWorld({ x: event.clientX, y: event.clientY }),
    hoverTargetId: null,
  };
}

function handleAuraClick(artifact: Artifact) {
  if (suppressNextAuraClick) {
    suppressNextAuraClick = false;
    return;
  }
  weaveSourceId.value = weaveSourceId.value === artifact.id ? null : artifact.id;
}

function handleAuraKeydown(event: KeyboardEvent, artifact: Artifact) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  event.stopPropagation();
  handleAuraClick(artifact);
}

function handleAuraPointerMove(event: PointerEvent) {
  const state = connectDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  state.toWorld = screenToWorld({ x: event.clientX, y: event.clientY });
  state.hoverTargetId = findArtifactAtWorldPoint(state.toWorld, state.fromId)?.id ?? null;
}

function handleAuraPointerUp(event: PointerEvent) {
  const state = connectDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  connectDragState.value = null;
  if (state.hoverTargetId) {
    suppressNextAuraClick = true;
    weaveSourceId.value = null;
    void createConnection(state.fromId, state.hoverTargetId);
  }
}

async function breatheArtifact(artifact: Artifact) {
  if (isGenerating.value || regeneratingArtifactId.value) return;

  const incomingConnectionIds = connections.value
    .filter((connection) => connection.toId === artifact.id)
    .map((connection) => connection.id);
  pulsingConnectionIds.value = [...new Set([...pulsingConnectionIds.value, ...incomingConnectionIds])];
  for (const connectionId of incomingConnectionIds) {
    const timer = connectionPulseTimers.get(connectionId);
    if (timer) window.clearTimeout(timer);
    connectionPulseTimers.delete(connectionId);
    if (livingRuntime.getConnection(connectionId)?.hasPending) livingRuntime.breathe(connectionId);
  }
  await Promise.resolve();
  clearStale(artifact.id);

  try {
    await regenerateArtifact(artifact);
  } finally {
    pulsingConnectionIds.value = pulsingConnectionIds.value.filter((id) => !incomingConnectionIds.includes(id));
  }
}

const suggestionCache = ref<Record<string, ArtifactSuggestion[]>>({});
const suggestionsLoadingId = ref<string | null>(null);
const creatingSuggestionKey = ref<string | null>(null);
const queuedSuggestionKeys = ref<string[]>([]);
let suggestionTimer: number | null = null;
let suggestionRequestToken = 0;

const activeSuggestionArtifact = computed(() => {
  const id = selectedArtifactId.value;
  if (!id) return null;

  // While one of this bubble's ghosts is hatching, keep the ghosts visible so
  // the hatching one can show its orbit; any other generation hides them.
  const hatchingHere = creatingSuggestionKey.value?.startsWith(`${id}:`) ?? false;
  if ((isGenerating.value || regeneratingArtifactId.value) && !hatchingHere) return null;

  const artifact = findLiveArtifact(id);
  if (!artifact || artifact.parentId || deletingArtifactIds.value.includes(id)) return null;
  return artifact;
});

const activeSuggestions = computed(() => {
  const artifact = activeSuggestionArtifact.value;
  if (!artifact) return [];
  return suggestionCache.value[artifact.id] ?? [];
});

function suggestionKey(sourceId: string, suggestion: ArtifactSuggestion) {
  return `${sourceId}:${suggestion.kind}:${suggestion.title}`;
}

const queuedSuggestions = computed(() => {
  const source = activeSuggestionArtifact.value;
  if (!source) return [];
  return activeSuggestions.value
    .map((suggestion, index) => ({ suggestion, index, key: suggestionKey(source.id, suggestion) }))
    .filter((item) => queuedSuggestionKeys.value.includes(item.key));
});

function clearQueuedSuggestions() {
  queuedSuggestionKeys.value = [];
}

function toggleSuggestionQueue(suggestion: ArtifactSuggestion) {
  if (isGenerating.value || regeneratingArtifactId.value) return;
  const source = activeSuggestionArtifact.value;
  if (!source) return;

  const key = suggestionKey(source.id, suggestion);
  queuedSuggestionKeys.value = queuedSuggestionKeys.value.includes(key)
    ? queuedSuggestionKeys.value.filter((candidate) => candidate !== key)
    : [...queuedSuggestionKeys.value, key];
}

function scheduleSuggestions(artifactId: string) {
  if (suggestionTimer) window.clearTimeout(suggestionTimer);
  suggestionTimer = window.setTimeout(() => {
    void loadSuggestions(artifactId);
  }, 450);
}

// When the AI is unreachable (offline, rate-limited), the canvas still beckons.
function fallbackSuggestions(artifact: Artifact): ArtifactSuggestion[] {
  const seed = artifact.prompt || artifact.title;

  const byKind: Record<string, ArtifactSuggestion[]> = {
    image: [
      { kind: 'text', title: 'Give it words', prompt: `write a short, evocative text about: ${seed}`, reason: 'words for what the image only shows' },
      { kind: 'image', title: 'Another angle', prompt: `${seed}, seen from a completely different perspective`, reason: 'sees the same thing differently' },
      { kind: 'component', title: 'Bring it alive', prompt: `a small playful interactive component inspired by: ${seed}`, reason: 'lets you touch it' },
    ],
    text: [
      { kind: 'image', title: 'Paint it', prompt: `an image capturing the essence of: ${seed}`, reason: 'shows what the words mean' },
      { kind: 'text', title: 'What follows', prompt: `continue the thought of: ${seed}`, reason: 'the next chapter' },
      { kind: 'component', title: 'Make it usable', prompt: `an interactive component that presents this text beautifully: ${seed}`, reason: 'gives the words a home' },
    ],
    component: [
      { kind: 'text', title: 'Its story', prompt: `write a short story or description around: ${seed}`, reason: 'why this exists' },
      { kind: 'component', title: 'A companion', prompt: `a companion component that complements: ${seed}`, reason: 'they work together' },
      { kind: 'image', title: 'Its mood', prompt: `an atmospheric image setting the mood for: ${seed}`, reason: 'how it should feel' },
    ],
    video: [
      { kind: 'image', title: 'A still frame', prompt: `a single beautiful frame from: ${seed}`, reason: 'one caught moment' },
      { kind: 'text', title: 'The narration', prompt: `write narration for: ${seed}`, reason: 'a voice for the motion' },
      { kind: 'object', title: 'The scenes', prompt: `a structured scene list for: ${seed}`, reason: 'its skeleton' },
    ],
    object: [
      { kind: 'image', title: 'Picture it', prompt: `an image visualising: ${seed}`, reason: 'make it visible' },
      { kind: 'component', title: 'Make it living', prompt: `an interactive component to explore: ${seed}`, reason: 'walk around inside it' },
      { kind: 'text', title: 'Explain it', prompt: `explain warmly and clearly: ${seed}`, reason: 'its meaning in words' },
    ],
  };

  return byKind[artifact.kind] ?? byKind.object;
}

function fallbackConstellationActions(sources: Artifact[]): GroupAction[] {
  const kinds = new Set(sources.map((source) => source.kind));
  const names = sources.map((source) => source.title).join(', ');
  const sharedInstruction = `Use every selected source (${names}) as living input, retaining the useful differences between them.`;

  if (kinds.size === 1 && kinds.has('text')) {
    return [
      {
        id: 'distil',
        kind: 'text',
        title: 'Distil the thread',
        prompt: `${sharedInstruction} Create one clear, concise synthesis that captures the shared meaning, tensions, and strongest language.`,
        reason: 'finds the signal across the writing',
      },
      {
        id: 'rewrite',
        kind: 'text',
        title: 'Rewrite together',
        prompt: `${sharedInstruction} Rewrite the material as one cohesive piece with a confident voice, preserving the best ideas from each source.`,
        reason: 'lets separate voices become one',
      },
      {
        id: 'printable',
        kind: 'component',
        title: 'Printable composition',
        prompt: `${sharedInstruction} Build a beautifully typeset, printable Vue composition that presents this writing as a quiet finished piece.`,
        reason: 'gives the words a physical form',
      },
    ];
  }

  if (kinds.has('text') && kinds.has('image') && kinds.has('component')) {
    return [
      {
        id: 'story-interface',
        kind: 'component',
        title: 'Story interface',
        prompt: `${sharedInstruction} Build a self-contained Vue experience where the image, text, and existing component work together as an interactive story.`,
        reason: 'turns the constellation into an experience',
      },
      {
        id: 'speaking-image',
        kind: 'component',
        title: 'Let it speak',
        prompt: `${sharedInstruction} Build a clickable Vue component that lets the image reveal and perform the text in a meaningful, tactile way.`,
        reason: 'makes the image and words answer each other',
      },
      {
        id: 'input-output',
        kind: 'component',
        title: 'Make a transformer',
        prompt: `${sharedInstruction} Build a small Vue tool that lets a person transform the selected text through the image and component’s interaction model.`,
        reason: 'gives the material a new behaviour',
      },
    ];
  }

  if (kinds.has('text') && kinds.has('image')) {
    return [
      {
        id: 'narrate',
        kind: 'text',
        title: 'Narrate the image',
        prompt: `${sharedInstruction} Write an evocative text that gives the image a voice, using the selected writing as its emotional and conceptual guide.`,
        reason: 'lets the visual and verbal become one voice',
      },
      {
        id: 'interactive-caption',
        kind: 'component',
        title: 'Make it speak',
        prompt: `${sharedInstruction} Build a self-contained Vue component where a person can explore the image and uncover the selected text through interaction.`,
        reason: 'turns a caption into an encounter',
      },
      {
        id: 'printable-poster',
        kind: 'component',
        title: 'Printable poster',
        prompt: `${sharedInstruction} Build a printable Vue composition that combines the visual source and writing into a compelling poster or editorial page.`,
        reason: 'makes a shareable composition',
      },
    ];
  }

  if (kinds.has('component')) {
    return [
      {
        id: 'compose-interface',
        kind: 'component',
        title: 'Compose an interface',
        prompt: `${sharedInstruction} Build one purposeful self-contained Vue component that turns the selected materials into a coherent interactive tool.`,
        reason: 'gives the constellation a useful surface',
      },
      {
        id: 'explain-system',
        kind: 'text',
        title: 'Explain the system',
        prompt: `${sharedInstruction} Write a lucid explanation of how these artifacts relate, what they enable, and how someone should use them together.`,
        reason: 'makes the relationship legible',
      },
      {
        id: 'living-brief',
        kind: 'object',
        title: 'Make a living brief',
        prompt: `${sharedInstruction} Create a structured semantic brief that captures the goals, inputs, behaviours, and next decisions for this constellation.`,
        reason: 'turns a cluster into an actionable shape',
      },
    ];
  }

  return [
    {
      id: 'synthesise',
      kind: 'text',
      title: 'Find the thread',
      prompt: `${sharedInstruction} Create a thoughtful synthesis that explains the shared idea and the most interesting relationships between the sources.`,
      reason: 'reveals what the group is really about',
    },
    {
      id: 'new-structure',
      kind: 'object',
      title: 'Give it a shape',
      prompt: `${sharedInstruction} Create a clear structured object that reorganises these sources into a useful new model or plan.`,
      reason: 'makes the constellation easier to act on',
    },
    {
      id: 'new-experience',
      kind: 'component',
      title: 'Make it living',
      prompt: `${sharedInstruction} Build a small self-contained Vue experience that lets someone explore and use the ideas together.`,
      reason: 'turns related things into behaviour',
    },
  ];
}

function constellationSources(selection = activeConstellation.value) {
  if (!selection) return [];
  return selection.artifactIds.map(findLiveArtifact).filter((artifact): artifact is Artifact => Boolean(artifact && !artifact.parentId));
}

function constellationConnectedInputs(sources: Artifact[], action: GroupAction): ConnectedInput[] {
  return sources.map((source) => ({
    meaning: `${action.title.toLowerCase()} source`,
    kind: source.kind,
    title: source.title,
    content: artifactContentSnippet(source),
  }));
}

function dismissConstellation() {
  constellationActionRequestToken += 1;
  constellation.value = null;
  constellationActions.value = [];
  queuedConstellationActionIds.value = [];
  constellationActionsLoading.value = false;
  isCustomConstellationPromptOpen.value = false;
  customConstellationPrompt.value = '';
}

async function loadConstellationActions(selection: Constellation) {
  const sources = constellationSources(selection);
  if (sources.length < 2) return;

  const fallback = fallbackConstellationActions(sources);
  constellationActions.value = fallback;
  constellationActionsLoading.value = true;
  const token = ++constellationActionRequestToken;

  try {
    const actions = await suggestGroupActions({
      artifacts: sources.map((source) => ({
        id: source.id,
        kind: source.kind,
        title: source.title,
        prompt: source.prompt,
        purpose: source.content.purpose ?? '',
        summary: source.content.summary ?? '',
        content: artifactContentSnippet(source),
        ports: source.content.ports ?? { inputs: [], outputs: [] },
      })),
      canvasContext: createCanvasContext(),
    });

    if (token !== constellationActionRequestToken || !constellation.value) return;
    if (actions.length) constellationActions.value = actions;
  } catch (error) {
    console.warn('Constellation action planning failed, keeping local actions.', error);
  } finally {
    if (token === constellationActionRequestToken) constellationActionsLoading.value = false;
  }
}

function createConstellation(artifactIds: string[]) {
  const sources = artifactIds.map(findLiveArtifact).filter((artifact): artifact is Artifact => Boolean(artifact && !artifact.parentId));
  if (sources.length < 2) return;

  const bounds = sources.map(artifactRenderedBounds);
  const minX = Math.min(...bounds.map((bound) => bound.x));
  const minY = Math.min(...bounds.map((bound) => bound.y));
  const maxX = Math.max(...bounds.map((bound) => bound.x + bound.w));
  const maxY = Math.max(...bounds.map((bound) => bound.y + bound.h));
  const selection: Constellation = {
    artifactIds: sources.map((source) => source.id),
    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    radius: Math.max(maxX - minX, maxY - minY) / 2,
  };

  selectedArtifactId.value = null;
  activeActionArtifactId.value = null;
  inspectedArtifactId.value = null;
  isDotActive.value = false;
  resetPromptMode();
  constellation.value = selection;
  void loadConstellationActions(selection);
}

function constellationActionPosition(index: number, total: number) {
  const selection = activeConstellation.value;
  if (!selection) return dot.value;
  const angle = ((-145 + (index * 290) / Math.max(total - 1, 1)) * Math.PI) / 180;
  const radius = Math.max(154, selection.radius + 134);
  return {
    x: selection.center.x + Math.cos(angle) * radius,
    y: selection.center.y + Math.sin(angle) * radius,
  };
}

function constellationResultPosition(action: GroupAction) {
  const index = Math.max(constellationActions.value.findIndex((candidate) => candidate.id === action.id), 0);
  const point = constellationActionPosition(index, constellationActions.value.length + 1);
  return { x: point.x - ARTIFACT_WIDTH / 2, y: point.y - ARTIFACT_HEIGHT / 2 };
}

function toggleConstellationActionQueue(action: GroupAction) {
  if (isGenerating.value || regeneratingArtifactId.value) return;
  queuedConstellationActionIds.value = queuedConstellationActionIds.value.includes(action.id)
    ? queuedConstellationActionIds.value.filter((id) => id !== action.id)
    : [...queuedConstellationActionIds.value, action.id];
}

async function executeQueuedConstellationActions() {
  if (isGenerating.value || regeneratingArtifactId.value) return;
  const actions = queuedConstellationActions.value;
  const sources = constellationSources();
  if (!actions.length || sources.length < 2) return;

  creatingConstellationActionId.value = 'batch';
  isGenerating.value = true;

  try {
    const batches = await Promise.all(
      actions.map(async (action) => {
        const generated = await requestGeneratedArtifacts(
          action.prompt,
          'create',
          undefined,
          action.kind,
          constellationConnectedInputs(sources, action),
        );
        return { action, generated, position: constellationResultPosition(action) };
      }),
    );

    const created = batches.flatMap(({ action, generated, position }) => {
      const results = placeGeneratedArtifacts(generated, action.prompt, position);
      const meaning = action.reason.toLowerCase().replace(/\.$/, '').slice(0, 60);
      results.forEach((result) => {
        sources.forEach((source) => void createConnection(source.id, result.id, meaning));
        clearStale(result.id);
      });
      return results;
    });

    dismissConstellation();
    selectedArtifactId.value = created[0]?.id ?? null;
  } finally {
    isGenerating.value = false;
    creatingConstellationActionId.value = null;
  }
}

async function executeConstellationAction(action: GroupAction, customPrompt?: string) {
  if (isGenerating.value || regeneratingArtifactId.value) return;
  const sources = constellationSources();
  if (sources.length < 2) return;

  const prompt = customPrompt
    ? `${customPrompt}\n\nUse the lassoed constellation as living source material. Make one meaningful new artifact that uses every source where relevant.`
    : action.prompt;
  const position = constellationResultPosition(action);
  creatingConstellationActionId.value = action.id;
  isGenerating.value = true;

  try {
    const generated = await requestGeneratedArtifacts(
      prompt,
      'create',
      undefined,
      customPrompt ? undefined : action.kind,
      constellationConnectedInputs(sources, action),
    );
    const created = placeGeneratedArtifacts(generated, prompt, position);
    const meaning = customPrompt ? 'made from this constellation' : action.reason.toLowerCase().replace(/\.$/, '').slice(0, 60);

    created.forEach((result) => {
      sources.forEach((source) => {
        void createConnection(source.id, result.id, meaning);
      });
      clearStale(result.id);
    });

    dismissConstellation();
    selectedArtifactId.value = created[0]?.id ?? null;
  } finally {
    isGenerating.value = false;
    creatingConstellationActionId.value = null;
  }
}

function openCustomConstellationPrompt() {
  if (!activeConstellation.value || isGenerating.value) return;
  queuedConstellationActionIds.value = [];
  isCustomConstellationPromptOpen.value = true;
  customConstellationPrompt.value = '';
  nextTick(() => customConstellationPromptInput.value?.focus());
}

function closeCustomConstellationPrompt() {
  isCustomConstellationPromptOpen.value = false;
  customConstellationPrompt.value = '';
}

function submitCustomConstellationPrompt() {
  const prompt = customConstellationPrompt.value.trim();
  if (!prompt) return;
  const action: GroupAction = {
    id: 'custom',
    kind: 'object',
    title: 'Your intention',
    prompt,
    reason: 'made from this constellation',
  };
  void executeConstellationAction(action, prompt);
}

async function loadSuggestions(artifactId: string) {
  if (suggestionCache.value[artifactId]?.length) return;

  const artifact = findLiveArtifact(artifactId);
  if (!artifact || artifact.parentId) return;

  const token = ++suggestionRequestToken;
  suggestionsLoadingId.value = artifactId;

  try {
    const suggestions = await suggestNextArtifacts({
      artifact: {
        kind: artifact.kind,
        title: artifact.title,
        prompt: artifact.prompt,
        purpose: artifact.content.purpose ?? '',
        summary: artifact.content.summary ?? '',
      },
      canvasContext: createCanvasContext(),
    });

    if (token !== suggestionRequestToken) return;
    suggestionCache.value = {
      ...suggestionCache.value,
      [artifactId]: suggestions.length ? suggestions : fallbackSuggestions(artifact),
    };
  } catch (error) {
    console.warn('Suggestion request failed, sprouting local seeds.', error);
    if (token === suggestionRequestToken) {
      suggestionCache.value = { ...suggestionCache.value, [artifactId]: fallbackSuggestions(artifact) };
    }
  } finally {
    if (suggestionsLoadingId.value === artifactId) suggestionsLoadingId.value = null;
  }
}

function ghostSuggestionPosition(artifact: Artifact, index: number, total: number) {
  const angles = total <= 1 ? [0] : total === 2 ? [-26, 26] : [-40, 0, 40];
  const angle = ((angles[index] ?? 0) * Math.PI) / 180;
  const centerX = artifact.x + artifact.width / 2;
  const centerY = artifact.y + getArtifactRenderHeight(artifact) / 2;
  const radius = Math.max(artifact.width, getArtifactRenderHeight(artifact)) / 2 + 148;

  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}

function ghostWeavePosition(artifact: Artifact) {
  const center = artifactCenter(artifact);
  const radius = Math.max(artifactRenderedBounds(artifact).w, artifactRenderedBounds(artifact).h) / 2 + 158;
  return { x: center.x - radius, y: center.y };
}

async function executeQueuedSuggestions() {
  if (isGenerating.value || regeneratingArtifactId.value) return;

  const source = activeSuggestionArtifact.value;
  const queued = queuedSuggestions.value;
  if (!source || !queued.length) return;

  creatingSuggestionKey.value = `${source.id}:batch`;
  isGenerating.value = true;

  try {
    const batches = await Promise.all(
      queued.map(async ({ suggestion, index }) => {
        const position = ghostSuggestionPosition(source, index, activeSuggestions.value.length);
        const generated = await requestGeneratedArtifacts(suggestion.prompt, 'create', undefined, suggestion.kind, [
          { meaning: suggestion.reason.toLowerCase().replace(/\.$/, '').slice(0, 60), kind: source.kind, title: source.title, content: artifactContentSnippet(source) },
        ]);
        return { suggestion, generated, position };
      }),
    );

    const created = batches.flatMap(({ suggestion, generated, position }) => {
      const results = placeGeneratedArtifacts(generated, suggestion.prompt, {
        x: position.x - ARTIFACT_WIDTH / 2,
        y: position.y - 60,
      });
      const meaning = suggestion.reason.toLowerCase().replace(/\.$/, '').slice(0, 60);
      results.forEach((result) => {
        void createConnection(source.id, result.id, meaning);
        clearStale(result.id);
      });
      return results;
    });

    const queuedKeys = new Set(queued.map(({ key }) => key));
    const remaining = (suggestionCache.value[source.id] ?? []).filter((item) => !queuedKeys.has(suggestionKey(source.id, item)));
    if (remaining.length) {
      suggestionCache.value = { ...suggestionCache.value, [source.id]: remaining };
    } else {
      const { [source.id]: _consumed, ...rest } = suggestionCache.value;
      suggestionCache.value = rest;
    }

    clearQueuedSuggestions();
    selectedArtifactId.value = created[0]?.id ?? null;
    activeActionArtifactId.value = null;
  } finally {
    isGenerating.value = false;
    creatingSuggestionKey.value = null;
  }
}

watch(selectedArtifactId, (id) => {
  clearQueuedSuggestions();
  if (id) scheduleSuggestions(id);
  void nextTick(syncSelectedArtifactMeasurement);
});

async function hydrateImageArtifact(artifactId: string) {
  const artifact = findLiveArtifact(artifactId);
  if (!artifact || artifact.kind !== 'image') return;
  if (artifact.content.imageUrl || artifact.content.imageStatus === 'pending') return;

  // Local-fallback artifacts have no provider; without a reachable AI backend
  // the placeholder spec is the final state.
  if (!artifact.content.provider || !artifact.content.imagePrompt) return;

  artifact.content.imageStatus = 'pending';

  try {
    const result = await generateImageWithAi(artifact.content.imagePrompt, selectedImageModel.value);
    const live = findLiveArtifact(artifactId);
    if (!live || live.content !== artifact.content) return;

    live.content.imageUrl = result.image;
    live.content.imageStatus = 'ready';
    if (result.model) live.content.model = result.model;
    publishArtifactOutputs(live);
  } catch (error) {
    console.warn('Image generation failed.', error);
    const live = findLiveArtifact(artifactId);
    if (live && live.content === artifact.content) live.content.imageStatus = 'error';
  }
}

function retryImageArtifact(artifact: Artifact) {
  if (artifact.content.imageStatus !== 'error') return;
  artifact.content.imageStatus = undefined;
  void hydrateImageArtifact(artifact.id);
}

function placeGeneratedArtifactTree(generated: GeneratedArtifact, nextPrompt: string, position: Point, parentId?: string) {
  const artifact = createArtifactFromGenerated(generated, nextPrompt, position, parentId);
  artifacts.value.push(artifact);
  void hydrateImageArtifact(artifact.id);

  generated.children?.forEach((child, index) => {
    placeGeneratedArtifactTree(
      child,
      child.title,
      { x: artifact.x + 28 + index * 18, y: artifact.y + artifact.height + 32 },
      artifact.id,
    );
  });

  return artifact;
}

function placeGeneratedArtifacts(generatedArtifacts: GeneratedArtifact[], nextPrompt: string, position: Point) {
  return generatedArtifacts.map((generated, index) =>
    placeGeneratedArtifactTree(generated, nextPrompt, {
      x: position.x + index * (ARTIFACT_WIDTH + 38),
      y: position.y + (index % 2) * 36,
    }),
  );
}

function evolveArtifactConnections(artifactId: string) {
  for (const connection of connections.value) {
    if (connection.fromId !== artifactId && connection.toId !== artifactId) continue;
    const from = findLiveArtifact(connection.fromId);
    const to = findLiveArtifact(connection.toId);
    if (!from || !to) continue;

    // Regeneration may rename or reshape a component's ports. Re-graft the
    // relationship onto the best compatible pair so an evolving artifact does
    // not silently leave dead endpoint ids behind.
    const binding = chooseConnectionBinding(from, to);
    connection.fromPortId = binding.fromPort?.id;
    connection.toPortId = binding.toPort?.id;
    connection.policy =
      binding.policy !== 'breathe' && wouldCloseAutomaticConnectionCycle(connection.fromId, connection.toId)
        ? 'breathe'
        : binding.policy;
    connection.status = 'resting';
    connection.error = undefined;
    if (connection.policy === 'breathe') markStale(connection.toId);
  }
}

function applyGeneratedArtifact(target: Artifact, generated: GeneratedArtifact, nextPrompt: string) {
  const mapped = createArtifactFromGenerated(generated, nextPrompt, { x: target.x, y: target.y }, target.parentId);
  const previousRuntime = ensureArtifactRuntime(target);
  const nextInputIds = new Set(mapped.content.ports?.inputs.map((port) => port.id) ?? []);

  target.kind = mapped.kind;
  target.title = mapped.title;
  target.prompt = nextPrompt;
  target.content = mapped.content;
  target.runtime = {
    inputs: Object.fromEntries(Object.entries(previousRuntime.inputs).filter(([portId]) => nextInputIds.has(portId))),
    outputs: {},
    revision: previousRuntime.revision + 1,
    updatedAt: new Date().toISOString(),
  };
  evolveArtifactConnections(target.id);
  syncLivingRuntime();
  if (target.kind !== 'component') publishArtifactOutputs(target);
  void hydrateImageArtifact(target.id);

  // The change flows outward: connected downstream bubbles may want to breathe.
  markDownstreamStale(target.id);

  generated.children?.forEach((child, index) => {
    placeGeneratedArtifactTree(
      child,
      child.title,
      { x: target.x + 28 + index * 18, y: target.y + target.height + 32 },
      target.id,
    );
  });
}

function getNestingCandidate(artifact: Artifact, screenPoint: Point) {
  const worldPoint = screenToWorld(screenPoint);

  return topLevelArtifacts.value.find((candidate) => {
    if (!canNestArtifact(artifact, candidate)) return false;

    const renderHeight = getArtifactRenderHeight(candidate);
    return (
      worldPoint.x >= candidate.x &&
      worldPoint.x <= candidate.x + candidate.width &&
      worldPoint.y >= candidate.y &&
      worldPoint.y <= candidate.y + renderHeight
    );
  }) ?? null;
}

function nestArtifact(child: Artifact, parent: Artifact) {
  child.parentId = parent.id;
  selectedArtifactId.value = parent.id;
  activeActionArtifactId.value = null;
  inspectedArtifactId.value = null;
  dropTargetArtifactId.value = null;
  inspectorEditPrompt.value = '';
}

function extractNestedArtifact(child: Artifact, parent: Artifact, index: number) {
  child.parentId = undefined;
  child.x = parent.x + 28 + index * 18;
  child.y = parent.y + getArtifactRenderHeight(parent) + 24;
  selectedArtifactId.value = child.id;
  activeActionArtifactId.value = null;
}

const LASSO_ARM_DELAY_MS = 180;

function clearLassoArmTimer() {
  if (lassoArmTimer !== null) window.clearTimeout(lassoArmTimer);
  lassoArmTimer = null;
}

function pointDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function appendLassoPoint(state: LassoState, point: Point) {
  const previous = state.points[state.points.length - 1];
  if (!previous || pointDistance(previous, point) >= 3) state.points.push(point);
}

function lassoPathLength(points: Point[]) {
  return points.slice(1).reduce((length, point, index) => length + pointDistance(points[index], point), 0);
}

function lassoArea(points: Point[]) {
  return Math.abs(
    points.reduce((area, point, index) => {
      const next = points[(index + 1) % points.length];
      return area + point.x * next.y - next.x * point.y;
    }, 0) / 2,
  );
}

function pointIsInsidePolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const crosses =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x < ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) / (previousPoint.y - currentPoint.y) + currentPoint.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function lassoIsClosed(state: LassoState) {
  const length = lassoPathLength(state.points);
  const first = state.points[0];
  const last = state.points[state.points.length - 1];
  const closeEnough = first && last && pointDistance(first, last) <= Math.max(34, Math.min(108, length * 0.16));
  return state.points.length >= 8 && length >= 120 && lassoArea(state.points) >= 2200 && closeEnough;
}

function lassoedArtifactIds(state: LassoState) {
  return topLevelArtifacts.value
    .filter((artifact) => pointIsInsidePolygon(convertWorldToScreen(artifactCenter(artifact), state.startCamera), state.points))
    .map((artifact) => artifact.id);
}

function armLasso(pointerId: number) {
  const state = lassoState.value;
  if (!state || state.pointerId !== pointerId || state.hasMoved) return;
  state.armed = true;
  state.points = [state.startPoint];
  panState.value = null;
  camera.value = { ...state.startCamera };
  clearLassoArmTimer();
}

function cancelLasso(pointerId?: number) {
  const state = lassoState.value;
  if (pointerId !== undefined && state?.pointerId !== pointerId) return;
  clearLassoArmTimer();
  lassoState.value = null;
}

function handleDotPointerDown(event: PointerEvent) {
  if (isGenerating.value) return;
  event.stopPropagation();

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);

  dotDragState.value = {
    pointerId: event.pointerId,
    startPointerX: event.clientX,
    startPointerY: event.clientY,
    startX: dot.value.x,
    startY: dot.value.y,
    moved: false,
  };
}

function handleDotPointerMove(event: PointerEvent) {
  const state = dotDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const dx = (event.clientX - state.startPointerX) / camera.value.zoom;
  const dy = (event.clientY - state.startPointerY) / camera.value.zoom;

  if (Math.abs(event.clientX - state.startPointerX) + Math.abs(event.clientY - state.startPointerY) > 4) {
    state.moved = true;
  }

  dot.value = { x: state.startX + dx, y: state.startY + dy };
}

function handleDotPointerUp(event: PointerEvent) {
  const state = dotDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  dotDragState.value = null;

  if (!state.moved) {
    resetPromptMode();
    activatePrompt();
  }
}

function handleArtifactPointerDown(event: PointerEvent, artifact: Artifact) {
  if (deletingArtifactIds.value.includes(artifact.id) || artifact.parentId) return;

  if (weaveSourceId.value && weaveSourceId.value !== artifact.id) {
    const sourceId = weaveSourceId.value;
    event.preventDefault();
    event.stopPropagation();
    weaveSourceId.value = null;
    selectedArtifactId.value = artifact.id;
    void createConnection(sourceId, artifact.id);
    return;
  }

  event.stopPropagation();
  dismissConstellation();
  selectedArtifactId.value = artifact.id;

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);

  artifactDragState.value = {
    artifactId: artifact.id,
    pointerId: event.pointerId,
    startPointerX: event.clientX,
    startPointerY: event.clientY,
    startX: artifact.x,
    startY: artifact.y,
    moved: false,
  };
}

function handleArtifactKeydown(event: KeyboardEvent, artifact: Artifact) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  event.stopPropagation();

  if (weaveSourceId.value && weaveSourceId.value !== artifact.id) {
    const sourceId = weaveSourceId.value;
    weaveSourceId.value = null;
    selectedArtifactId.value = artifact.id;
    void createConnection(sourceId, artifact.id);
    return;
  }

  selectedArtifactId.value = artifact.id;
}

function handleArtifactPointerMove(event: PointerEvent) {
  const state = artifactDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const dx = (event.clientX - state.startPointerX) / camera.value.zoom;
  const dy = (event.clientY - state.startPointerY) / camera.value.zoom;

  if (Math.abs(event.clientX - state.startPointerX) + Math.abs(event.clientY - state.startPointerY) > 4) {
    state.moved = true;
  }

  const artifact = artifacts.value.find((item) => item.id === state.artifactId);
  if (!artifact || deletingArtifactIds.value.includes(artifact.id)) return;

  artifact.x = state.startX + dx;
  artifact.y = state.startY + dy;

  if (state.moved) {
    dropTargetArtifactId.value = getNestingCandidate(artifact, { x: event.clientX, y: event.clientY })?.id ?? null;
  }
}

function handleArtifactPointerUp(event: PointerEvent) {
  const state = artifactDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);

  const artifact = artifacts.value.find((item) => item.id === state.artifactId);
  const parent = dropTargetArtifactId.value ? artifacts.value.find((item) => item.id === dropTargetArtifactId.value) : null;

  artifactDragState.value = null;

  if (artifact && parent && state.moved && canNestArtifact(artifact, parent)) {
    nestArtifact(artifact, parent);
    return;
  }

  dropTargetArtifactId.value = null;
}

function handleDeletedMarkerPointerDown(event: PointerEvent, marker: DeletedMarker) {
  event.stopPropagation();

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);

  deletedMarkerDragState.value = {
    markerId: marker.id,
    pointerId: event.pointerId,
    startPointerX: event.clientX,
    startPointerY: event.clientY,
    startX: marker.x,
    startY: marker.y,
    moved: false,
  };
}

function handleDeletedMarkerPointerMove(event: PointerEvent) {
  const state = deletedMarkerDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const dx = (event.clientX - state.startPointerX) / camera.value.zoom;
  const dy = (event.clientY - state.startPointerY) / camera.value.zoom;

  if (Math.abs(event.clientX - state.startPointerX) + Math.abs(event.clientY - state.startPointerY) > 4) {
    state.moved = true;
  }

  const marker = deletedMarkers.value.find((item) => item.id === state.markerId);
  if (!marker) return;

  marker.x = state.startX + dx;
  marker.y = state.startY + dy;
}

function handleDeletedMarkerPointerUp(event: PointerEvent, marker: DeletedMarker) {
  const state = deletedMarkerDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  deletedMarkerDragState.value = null;

  if (!state.moved) {
    revitalizeDeletedMarker(marker);
  }
}

function handleInspectorPointerDown(event: PointerEvent) {
  event.stopPropagation();

  const rect = inspectorPanel.value?.getBoundingClientRect();
  if (!rect) return;

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);

  inspectorDragState.value = {
    pointerId: event.pointerId,
    startPointerX: event.clientX,
    startPointerY: event.clientY,
    startX: rect.left,
    startY: rect.top,
    moved: false,
  };
}

function handleInspectorPointerMove(event: PointerEvent) {
  const state = inspectorDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const dx = event.clientX - state.startPointerX;
  const dy = event.clientY - state.startPointerY;

  if (Math.abs(dx) + Math.abs(dy) > 4) {
    state.moved = true;
  }

  inspectorPosition.value = clampInspectorPosition({ x: state.startX + dx, y: state.startY + dy });
}

function handleInspectorPointerUp(event: PointerEvent) {
  const state = inspectorDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  inspectorDragState.value = null;
}

function handleWorkspacePointerDown(event: PointerEvent) {
  if (!isWorkspaceGestureTarget(event)) return;

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);

  const startPoint = { x: event.clientX, y: event.clientY };

  panState.value = {
    pointerId: event.pointerId,
    startPointerX: event.clientX,
    startPointerY: event.clientY,
    startX: camera.value.x,
    startY: camera.value.y,
    moved: false,
  };

  // A short, still press turns a blank-canvas gesture into a lasso. Immediate
  // drags retain the existing pan behaviour, so the surface stays fluid.
  if (event.isPrimary && event.button === 0 && event.pointerType !== 'touch') {
    lassoState.value = {
      pointerId: event.pointerId,
      startCamera: { ...camera.value },
      startPoint,
      points: [startPoint],
      armed: false,
      hasMoved: false,
    };

    if (event.shiftKey) {
      armLasso(event.pointerId);
    } else {
      clearLassoArmTimer();
      lassoArmTimer = window.setTimeout(() => armLasso(event.pointerId), LASSO_ARM_DELAY_MS);
    }
  }
}

function handleWorkspacePointerMove(event: PointerEvent) {
  const lasso = lassoState.value;
  if (lasso?.pointerId === event.pointerId) {
    const point = { x: event.clientX, y: event.clientY };
    if (lasso.armed) {
      appendLassoPoint(lasso, point);
      return;
    }

    if (pointDistance(lasso.startPoint, point) > 8) {
      lasso.hasMoved = true;
      clearLassoArmTimer();
    }
  }

  const state = panState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const dx = event.clientX - state.startPointerX;
  const dy = event.clientY - state.startPointerY;

  if (Math.abs(dx) + Math.abs(dy) > 4) {
    state.moved = true;
  }

  camera.value = { ...camera.value, x: state.startX + dx, y: state.startY + dy };
}

function handleWorkspacePointerUp(event: PointerEvent) {
  const lasso = lassoState.value;
  if (lasso?.pointerId === event.pointerId && lasso.armed) {
    const target = event.currentTarget as HTMLElement;
    appendLassoPoint(lasso, { x: event.clientX, y: event.clientY });
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    panState.value = null;
    cancelLasso(event.pointerId);

    if (lassoIsClosed(lasso)) {
      const selectedIds = lassoedArtifactIds(lasso);
      if (selectedIds.length >= 2) createConstellation(selectedIds);
    }
    return;
  }

  cancelLasso(event.pointerId);
  const state = panState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  panState.value = null;

  // Only a genuine background click dismisses open bubbles — a pan keeps them.
  if (!state.moved) {
    closeTransientUi();

    if (event.detail >= 2) {
      openPromptAtScreenPoint({ x: state.startPointerX, y: state.startPointerY });
      return;
    }

    dot.value = screenToWorld({ x: state.startPointerX, y: state.startPointerY });
  }
}

function handleWorkspacePointerCancel(event: PointerEvent) {
  cancelLasso(event.pointerId);
  const state = panState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
  panState.value = null;
}

function handleWorkspaceDoubleClick(event: MouseEvent) {
  if (!isWorkspaceGestureTarget(event)) return;

  event.preventDefault();
  openPromptAtScreenPoint({ x: event.clientX, y: event.clientY });
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  zoomAt({ x: event.clientX, y: event.clientY }, camera.value.zoom * (event.deltaY > 0 ? 0.92 : 1.08));
}

function closePrompt() {
  if (isGenerating.value || regeneratingArtifactId.value) return;
  isDotActive.value = false;
  resetPromptMode();
}

async function regenerateArtifact(artifact: Artifact) {
  if (regeneratingArtifactId.value || deletingArtifactIds.value.includes(artifact.id)) return;

  regeneratingArtifactId.value = artifact.id;
  activeActionArtifactId.value = null;

  try {
    const generated = await requestGeneratedArtifacts('', 'regenerate', artifact);
    const current = artifacts.value.find((item) => item.id === artifact.id);
    if (current && generated[0]) {
      applyGeneratedArtifact(current, generated[0], current.prompt);
      selectedArtifactId.value = current.id;
    }
  } finally {
    regeneratingArtifactId.value = null;
  }
}

async function submitPrompt() {
  const value = prompt.value.trim();
  const mode = promptMode.value;

  if (isGenerating.value || regeneratingArtifactId.value) return;
  if (mode.type === 'create' && !value) return;

  if (mode.type === 'edit' && !value) {
    const artifact = artifacts.value.find((item) => item.id === mode.artifactId);
    if (!artifact) return;

    await regenerateArtifact(artifact);
    isDotActive.value = false;
    resetPromptMode();
    return;
  }

  isGenerating.value = true;

  try {
    if (mode.type === 'edit') {
      const artifact = artifacts.value.find((item) => item.id === mode.artifactId);
      if (artifact) {
        const generated = await requestGeneratedArtifacts(value, 'edit', artifact);
        if (generated[0]) {
          applyGeneratedArtifact(artifact, generated[0], value);
          selectedArtifactId.value = artifact.id;
        }
      }
    } else {
      const generated = await requestGeneratedArtifacts(value, 'create');
      const created = placeGeneratedArtifacts(generated, value, chooseArtifactPosition(dot.value));
      selectedArtifactId.value = created[0]?.id ?? null;
    }

    activeActionArtifactId.value = null;
    isDotActive.value = false;
    resetPromptMode();
  } finally {
    isGenerating.value = false;
  }
}

async function submitInspectorEdit() {
  const artifact = inspectedArtifact.value;
  if (!artifact || isGenerating.value || regeneratingArtifactId.value) return;

  const value = inspectorEditPrompt.value.trim();

  if (!value) {
    await regenerateArtifact(artifact);
    return;
  }

  isGenerating.value = true;
  activeActionArtifactId.value = null;

  try {
    const generated = await requestGeneratedArtifacts(value, 'edit', artifact);
    const current = artifacts.value.find((item) => item.id === artifact.id);
    if (current && generated[0]) {
      applyGeneratedArtifact(current, generated[0], value);
      selectedArtifactId.value = current.id;
      inspectorEditPrompt.value = '';
    }
  } finally {
    isGenerating.value = false;
  }
}

function inspectArtifact(artifact: Artifact) {
  if (deletingArtifactIds.value.includes(artifact.id)) return;

  inspectedArtifactId.value = artifact.id;
  selectedArtifactId.value = artifact.id;
  activeActionArtifactId.value = null;
  inspectorEditPrompt.value = '';
}

function startPromptArtifact(artifact: Artifact) {
  if (deletingArtifactIds.value.includes(artifact.id)) return;

  promptMode.value = { type: 'edit', artifactId: artifact.id };
  prompt.value = '';
  selectedArtifactId.value = artifact.id;
  activeActionArtifactId.value = null;
  activatePrompt();
}

function forkArtifact(artifact: Artifact) {
  if (deletingArtifactIds.value.includes(artifact.id)) return;

  const fork = cloneArtifact(artifact);
  fork.id = crypto.randomUUID();
  fork.title = `Fork of ${artifact.title}`;
  fork.x = artifact.x + 74;
  fork.y = artifact.y + 34;
  fork.createdAt = nowLabel();
  fork.parentId = undefined;

  artifacts.value.push(fork);
  animateForkSplit(artifact.id, fork.id);
  selectedArtifactId.value = fork.id;
  activeActionArtifactId.value = null;
}

function completeDeleteTransition(artifact: Artifact) {
  const removed = cloneArtifact(artifact);
  const children = getChildArtifacts(artifact.id);

  children.forEach((child, index) => {
    child.parentId = undefined;
    child.x = artifact.x + 32 + index * 34;
    child.y = artifact.y + getArtifactRenderHeight(artifact) + 34;
  });

  artifacts.value = artifacts.value.filter((item) => item.id !== artifact.id);
  deletingArtifactIds.value = deletingArtifactIds.value.filter((id) => id !== artifact.id);
  deletionTimers.delete(artifact.id);

  deletedMarkers.value.push({
    id: crypto.randomUUID(),
    artifact: removed,
    title: removed.title,
    x: removed.x + removed.width / 2,
    y: removed.y + getArtifactRenderHeight(removed) / 2,
    createdAt: nowLabel(),
  });
}

function deleteArtifact(artifact: Artifact) {
  if (deletingArtifactIds.value.includes(artifact.id)) return;

  deletingArtifactIds.value.push(artifact.id);
  selectedArtifactId.value = null;
  activeActionArtifactId.value = null;
  artifactDragState.value = null;

  if (inspectedArtifactId.value === artifact.id) {
    inspectedArtifactId.value = null;
    inspectorEditPrompt.value = '';
  }

  const timerId = window.setTimeout(() => completeDeleteTransition(artifact), DELETE_TRANSITION_MS);
  deletionTimers.set(artifact.id, timerId);
}

function revitalizeDeletedMarker(marker: DeletedMarker) {
  const restored = cloneArtifact(marker.artifact);
  restored.parentId = undefined;
  artifacts.value.push(restored);
  deletedMarkers.value = deletedMarkers.value.filter((item) => item.id !== marker.id);
  selectedArtifactId.value = restored.id;
  activeActionArtifactId.value = null;
}

function clearDeletedMarkers() {
  deletedMarkers.value = [];
}

function toggleArtifactActions(artifact: Artifact) {
  if (deletingArtifactIds.value.includes(artifact.id)) return;

  selectedArtifactId.value = artifact.id;
  activeActionArtifactId.value = activeActionArtifactId.value === artifact.id ? null : artifact.id;
}

function closeInspector() {
  inspectedArtifactId.value = null;
  inspectorEditPrompt.value = '';
  inspectorDragState.value = null;
}

function fitAll() {
  const viewport = getViewport();
  const items = [
    { x: dot.value.x - 16, y: dot.value.y - 16, width: 32, height: 32 },
    ...topLevelArtifacts.value.map((artifact) => ({ x: artifact.x, y: artifact.y, width: artifact.width, height: getArtifactRenderHeight(artifact) })),
    ...deletedMarkers.value.map((marker) => ({ x: marker.x - 10, y: marker.y - 10, width: 20, height: 20 })),
  ];

  const minX = Math.min(...items.map((item) => item.x));
  const minY = Math.min(...items.map((item) => item.y));
  const maxX = Math.max(...items.map((item) => item.x + item.width));
  const maxY = Math.max(...items.map((item) => item.y + item.height));
  const boundsWidth = Math.max(maxX - minX, 1);
  const boundsHeight = Math.max(maxY - minY, 1);
  const zoom = clamp(
    Math.min((viewport.width - 120) / boundsWidth, (viewport.height - 220) / boundsHeight),
    MIN_ZOOM,
    1.25,
  );

  camera.value = {
    x: viewport.width / 2 - (minX + boundsWidth / 2) * zoom,
    y: viewport.height / 2 - (minY + boundsHeight / 2) * zoom,
    zoom,
  };
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

  if (event.key === 'Escape') {
    if (weaveSourceId.value) {
      weaveSourceId.value = null;
      return;
    }
    if (activeConstellation.value) {
      dismissConstellation();
      return;
    }
    if (inspectedArtifactId.value) {
      closeInspector();
      return;
    }
    closePrompt();
    activeActionArtifactId.value = null;
    dropTargetArtifactId.value = null;
  }

  if (isTyping) return;

  if (event.key.toLowerCase() === 'f') fitAll();
  if (event.key === '0') resetCamera();
}

onMounted(() => {
  componentHost = new DotComponentHost({
    getInputs: componentInputSnapshot,
    onEmit: handleComponentEmit,
    onReady: (artifactId) => setComponentRuntimeError(artifactId),
    onError: (artifactId, message) => setComponentRuntimeError(artifactId, message),
  });
  resetCamera();
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('pointerdown', handleGlobalPointerDownForPicker, true);
  window.addEventListener('resize', syncSelectedArtifactMeasurement);
  void fetchModelCatalog().then((catalog) => {
    modelCatalog.value = catalog;
  });
});

onUnmounted(() => {
  componentHost?.dispose();
  componentHost = null;
  stopLivingRuntimeSubscription();
  runtimePortRegistrations.forEach((registration) => registration.dispose());
  runtimePortRegistrations.clear();
  runtimeConnectionRegistrations.forEach((_registration, id) => livingRuntime.disconnect(id));
  runtimeConnectionRegistrations.clear();
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('pointerdown', handleGlobalPointerDownForPicker, true);
  window.removeEventListener('resize', syncSelectedArtifactMeasurement);
  selectedCardResizeObserver?.disconnect();
  clearLassoArmTimer();
  if (suggestionTimer) window.clearTimeout(suggestionTimer);
  if (tendrilRaf) cancelAnimationFrame(tendrilRaf);
  connectionPulseTimers.forEach((timerId) => window.clearTimeout(timerId));
  deletionTimers.forEach((timerId) => window.clearTimeout(timerId));
  forkAnimationTimers.forEach((timerId) => window.clearTimeout(timerId));
});
</script>

<template>
  <main
    class="workspace"
    :class="{
      'workspace--panning': Boolean(panState),
      'workspace--lassoing': Boolean(lassoState?.armed),
      'workspace--weave-targeting': Boolean(weaveSourceId),
    }"
    :style="gridStyle"
    aria-label="Dot creation canvas"
    @pointerdown="handleWorkspacePointerDown"
    @pointermove="handleWorkspacePointerMove"
    @pointerup="handleWorkspacePointerUp"
    @pointercancel="handleWorkspacePointerCancel"
    @dblclick="handleWorkspaceDoubleClick"
    @wheel="handleWheel"
  >
    <div class="ambient ambient--one" />
    <div class="ambient ambient--two" />

    <svg v-if="lassoPath" class="constellation-lasso" aria-hidden="true">
      <path :d="lassoPath" />
    </svg>

    <div class="world" :style="worldTransform">
      <svg class="tendril-layer" aria-hidden="true">
        <defs>
          <linearGradient
            v-for="edge in renderedConnections"
            :id="`tendril-grad-${edge.connection.id}`"
            :key="`grad-${edge.connection.id}`"
            gradientUnits="userSpaceOnUse"
            :x1="edge.from.x"
            :y1="edge.from.y"
            :x2="edge.to.x"
            :y2="edge.to.y"
          >
            <stop offset="0" stop-color="rgba(255, 188, 117, 0.6)" />
            <stop offset="1" stop-color="rgba(142, 255, 135, 0.6)" />
          </linearGradient>
        </defs>
        <g
          v-for="edge in renderedConnections"
          :key="edge.connection.id"
          class="tendril"
          :class="[
            `tendril--${edge.connection.status ?? 'resting'}`,
            `tendril--policy-${edge.connection.policy ?? 'breathe'}`,
            { 'tendril--pulsing': edge.pulsing },
          ]"
        >
          <path class="tendril__glow" :d="edge.path" :stroke="`url(#tendril-grad-${edge.connection.id})`" />
          <path class="tendril__core" :d="edge.path" :stroke="`url(#tendril-grad-${edge.connection.id})`" />
          <circle
            v-for="mote in edge.motes"
            :key="mote.key"
            class="tendril__mote"
            :cx="mote.x"
            :cy="mote.y"
            :r="mote.r"
            :opacity="mote.opacity"
          />
        </g>
        <path v-if="liveTendrilPath" class="tendril__live" :d="liveTendrilPath" />
      </svg>

      <button
        v-if="selectedTopLevelArtifact && selectedHaloBounds && !isGenerating && !regeneratingArtifactId"
        class="weave-halo"
        :class="{
          'weave-halo--weaving': Boolean(connectDragState),
          'weave-halo--awaiting': weaveSourceId === selectedTopLevelArtifact.id,
        }"
        type="button"
        :style="{
          left: `${selectedHaloBounds.x}px`,
          top: `${selectedHaloBounds.y}px`,
          width: `${selectedHaloBounds.w}px`,
          height: `${selectedHaloBounds.h}px`,
          '--weave-halo-radius': selectedHaloBounds.radius,
        }"
        :aria-label="
          weaveSourceId === selectedTopLevelArtifact.id
            ? 'Choose another bubble to complete this living connection'
            : 'Weave this bubble to another'
        "
        :aria-pressed="weaveSourceId === selectedTopLevelArtifact.id"
        @pointerdown="handleAuraPointerDown($event, selectedTopLevelArtifact)"
        @pointermove="handleAuraPointerMove"
        @pointerup="handleAuraPointerUp"
        @click="handleAuraClick(selectedTopLevelArtifact)"
        @keydown="handleAuraKeydown($event, selectedTopLevelArtifact)"
      />

      <template v-if="activeConstellation">
        <span
          class="constellation-core"
          :style="{
            left: `${activeConstellation.center.x}px`,
            top: `${activeConstellation.center.y}px`,
            width: `${Math.max(68, activeConstellation.radius * 1.24)}px`,
            height: `${Math.max(68, activeConstellation.radius * 1.24)}px`,
          }"
          aria-hidden="true"
        />

        <button
          v-for="(action, index) in constellationActions"
          :key="`constellation-${action.id}-${index}`"
          class="constellation-action"
          :class="{
            'constellation-action--queued': queuedConstellationActionIds.includes(action.id),
            'constellation-action--creating':
              creatingConstellationActionId === action.id ||
              (creatingConstellationActionId === 'batch' && queuedConstellationActionIds.includes(action.id)),
            'constellation-action--waiting':
              isGenerating && !(creatingConstellationActionId === 'batch' && queuedConstellationActionIds.includes(action.id)),
          }"
          type="button"
          :disabled="isGenerating"
          :title="action.reason"
          :aria-label="`Queue constellation action: ${action.title}`"
          :style="{
            left: `${constellationActionPosition(index, constellationOrbitCount).x}px`,
            top: `${constellationActionPosition(index, constellationOrbitCount).y}px`,
            '--constellation-delay': `${index * 120}ms`,
          }"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @click.stop="toggleConstellationActionQueue(action)"
        >
          <span>{{ action.title }}</span>
          <small>{{ action.reason }}</small>
          <i v-if="constellationActionsLoading" aria-hidden="true" />
        </button>

        <button
          v-if="!isCustomConstellationPromptOpen"
          class="constellation-action constellation-action--custom"
          :class="{ 'constellation-action--waiting': isGenerating }"
          type="button"
          :disabled="isGenerating"
          title="Describe a transformation for this constellation"
          aria-label="Describe a custom constellation action"
          :style="{
            left: `${constellationActionPosition(constellationActions.length, constellationOrbitCount).x}px`,
            top: `${constellationActionPosition(constellationActions.length, constellationOrbitCount).y}px`,
            '--constellation-delay': `${constellationActions.length * 120}ms`,
          }"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @click.stop="openCustomConstellationPrompt"
        >
          <span>Make something…</span>
          <small>your intention</small>
        </button>

        <form
          v-else
          class="constellation-custom-prompt"
          :class="{ 'constellation-custom-prompt--creating': creatingConstellationActionId === 'custom' }"
          :style="{
            left: `${constellationActionPosition(constellationActions.length, constellationOrbitCount).x}px`,
            top: `${constellationActionPosition(constellationActions.length, constellationOrbitCount).y}px`,
          }"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @submit.prevent="submitCustomConstellationPrompt"
        >
          <input
            ref="customConstellationPromptInput"
            v-model="customConstellationPrompt"
            :disabled="isGenerating"
            aria-label="Describe what to make from the selected constellation"
            placeholder="what should these become?"
            @keydown.esc.stop.prevent="closeCustomConstellationPrompt"
          />
          <span>enter to weave</span>
        </form>

        <button
          v-if="queuedConstellationActions.length"
          class="constellation-action constellation-action--weave"
          :class="{ 'constellation-action--creating': creatingConstellationActionId === 'batch' }"
          type="button"
          :disabled="isGenerating"
          :title="`Create ${queuedConstellationActions.length} selected actions`"
          :aria-label="`Weave ${queuedConstellationActions.length} selected constellation actions`"
          :style="{
            left: `${constellationActionPosition(constellationActions.length + 1, constellationOrbitCount).x}px`,
            top: `${constellationActionPosition(constellationActions.length + 1, constellationOrbitCount).y}px`,
            '--constellation-delay': `${(constellationActions.length + 1) * 120}ms`,
          }"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @click.stop="executeQueuedConstellationActions"
        >
          <span>Weave {{ queuedConstellationActions.length }}</span>
          <small>bring them into being</small>
        </button>
      </template>

      <button
        v-for="marker in deletedMarkers"
        :key="marker.id"
        class="deleted-marker"
        :class="{ 'deleted-marker--dragging': deletedMarkerDragState?.markerId === marker.id }"
        type="button"
        :title="`Revitalise: ${marker.title}`"
        :aria-label="`Revitalise deleted artifact ${marker.title}`"
        :style="{ left: `${marker.x}px`, top: `${marker.y}px` }"
        @pointerdown="handleDeletedMarkerPointerDown($event, marker)"
        @pointermove="handleDeletedMarkerPointerMove"
        @pointerup="handleDeletedMarkerPointerUp($event, marker)"
      >
        <span>revitalise</span>
      </button>

      <section
        v-for="artifact in topLevelArtifacts"
        :key="artifact.id"
        :ref="(element) => setArtifactCardElement(artifact.id, element as Element | null)"
        class="artifact-card"
        :class="[
          `artifact-card--kind-${artifact.kind}`,
          {
          'artifact-card--dragging': artifactDragState?.artifactId === artifact.id,
          'artifact-card--selected': selectedArtifactId === artifact.id,
          'artifact-card--regenerating': regeneratingArtifactId === artifact.id,
          'artifact-card--deleting': deletingArtifactIds.includes(artifact.id),
          'artifact-card--nest-target': dropTargetArtifactId === artifact.id,
          'artifact-card--has-children': getChildArtifacts(artifact.id).length,
          'artifact-card--splitting': splittingArtifactIds.includes(artifact.id),
          'artifact-card--fork-born': forkBornArtifactIds.includes(artifact.id),
          'artifact-card--image-orb': artifact.kind === 'image' && Boolean(artifact.content.imageUrl),
          'artifact-card--stale': staleArtifactIds.includes(artifact.id),
          'artifact-card--connect-target': connectDragState?.hoverTargetId === artifact.id,
          'artifact-card--lasso-candidate': lassoCandidateArtifactIds.includes(artifact.id),
          'artifact-card--constellation-source': activeConstellation?.artifactIds.includes(artifact.id),
          'artifact-card--runtime-error': Boolean(artifactRuntimeIssue(artifact.id)),
          },
        ]"
        :style="{
          left: `${artifact.x}px`,
          top: `${artifact.y}px`,
          width: `${artifact.width}px`,
          minHeight: `${getArtifactRenderHeight(artifact)}px`,
          '--bubble-growth': getChildArtifacts(artifact.id).length,
          ...artifactOrganicStyle(artifact),
        }"
        :data-artifact-id="artifact.id"
        tabindex="0"
        aria-label="Generated artifact. Drag to move."
        @pointerdown="handleArtifactPointerDown($event, artifact)"
        @pointermove="handleArtifactPointerMove"
        @pointerup="handleArtifactPointerUp"
        @keydown="handleArtifactKeydown($event, artifact)"
      >
        <div
          v-if="selectedArtifactId === artifact.id && !deletingArtifactIds.includes(artifact.id)"
          class="artifact-action-system"
          :class="{ 'artifact-action-system--open': activeActionArtifactId === artifact.id }"
          aria-label="Artifact actions"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @click.stop
        >
          <button class="artifact-action-root" type="button" aria-label="Show artifact actions" @click="toggleArtifactActions(artifact)">
            <span />
          </button>
          <button class="artifact-action artifact-action--inspect" type="button" data-label="inspect" aria-label="Inspect artifact" @click="inspectArtifact(artifact)">
            i
          </button>
          <button class="artifact-action artifact-action--edit" type="button" data-label="prompt" aria-label="Prompt this artifact" @click="startPromptArtifact(artifact)">
            ✎
          </button>
          <button class="artifact-action artifact-action--fork" type="button" data-label="fork" aria-label="Fork artifact" @click="forkArtifact(artifact)">
            ⟡
          </button>
          <button class="artifact-action artifact-action--delete" type="button" data-label="delete" aria-label="Remove artifact" @click="deleteArtifact(artifact)">
            ×
          </button>
        </div>

        <div class="artifact-card__eyebrow">
          {{ regeneratingArtifactId === artifact.id ? 'regenerating' : artifact.kind }} · {{ artifact.createdAt }}
        </div>
        <h2>{{ artifact.title }}</h2>

        <div class="artifact-content" :class="`artifact-content--${artifact.kind}`">
          <template v-if="artifact.kind === 'text'">
            <p>{{ artifact.content.markdown || artifact.content.text || artifact.content.raw }}</p>
          </template>

          <template v-else-if="artifact.kind === 'object'">
            <div class="object-preview">
              <div class="object-preview__header">
                <span>universal object</span>
                <strong>{{ artifact.content.description }}</strong>
              </div>
              <div class="object-preview__chips">
                <span v-for="tag in artifact.content.tags ?? []" :key="tag">{{ tag }}</span>
              </div>
              <div class="object-preview__grid">
                <div>
                  <small>inputs</small>
                  <span v-for="port in artifact.content.ports?.inputs ?? []" :key="port.id">{{ port.label }}</span>
                </div>
                <div>
                  <small>outputs</small>
                  <span v-for="port in artifact.content.ports?.outputs ?? []" :key="port.id">{{ port.label }}</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="artifact.kind === 'component'">
            <iframe
              class="component-frame"
              title="Sandboxed generated component"
              sandbox="allow-scripts"
              :data-dot-artifact-id="artifact.id"
              :srcdoc="createComponentSrcDoc(artifact.content)"
            />
            <span
              v-if="artifactRuntimeIssue(artifact.id)"
              class="component-runtime-error"
              :title="artifactRuntimeIssue(artifact.id)"
            >
              graft needs care
            </span>
          </template>

          <template v-else-if="artifact.kind === 'image'">
            <figure v-if="artifact.content.imageUrl" class="image-result">
              <img :src="artifact.content.imageUrl" :alt="artifact.content.alt ?? artifact.title" draggable="false" />
            </figure>

            <div
              v-else-if="artifact.content.imageStatus === 'pending'"
              class="image-preview image-preview--loading"
              role="img"
              :aria-label="`Generating image: ${artifact.content.alt ?? artifact.title}`"
            >
              <span />
              <p>painting…</p>
            </div>

            <div v-else class="image-preview" role="img" :aria-label="artifact.content.alt ?? artifact.title">
              <span />
              <p>{{ artifact.content.imagePrompt || artifact.content.description }}</p>
              <button
                v-if="artifact.content.imageStatus === 'error'"
                class="image-preview__retry"
                type="button"
                @pointerdown.stop
                @click.stop="retryImageArtifact(artifact)"
              >
                image failed · retry
              </button>
            </div>
          </template>

          <template v-else-if="artifact.kind === 'video'">
            <div class="video-preview">
              <span class="video-preview__play">▶</span>
              <ol>
                <li v-for="beat in artifact.content.storyboard ?? []" :key="beat">{{ beat }}</li>
              </ol>
            </div>
          </template>

          <template v-else>
            <p>{{ artifact.content.summary }}</p>
          </template>
        </div>

        <div v-if="getChildArtifacts(artifact.id).length" class="nested-bubbles" aria-label="Nested bubbles" @pointerdown.stop>
          <button
            v-for="(child, index) in getChildArtifacts(artifact.id)"
            :key="child.id"
            class="nested-bubble"
            type="button"
            :title="`Open ${child.title}`"
            @click="extractNestedArtifact(child, artifact, index)"
          >
            <span>{{ child.title }}</span>
            <small v-if="getChildArtifacts(child.id).length">{{ getChildArtifacts(child.id).length }}</small>
          </button>
        </div>

        <div v-else-if="dropTargetArtifactId === artifact.id" class="nested-drop-hint">drop inside</div>
      </section>

      <div
        v-for="edge in renderedConnections"
        :key="`meaning-${edge.connection.id}`"
        class="tendril-meaning"
        :class="`tendril-meaning--${edge.connection.status ?? 'resting'}`"
        :style="{ left: `${edge.mid.x}px`, top: `${edge.mid.y}px` }"
        :title="connectionBindingLabel(edge.connection)"
        @pointerdown.stop
        @pointerup.stop
      >
        <span>{{ edge.connection.meaning }}</span>
        <small>{{ connectionBindingLabel(edge.connection) }}</small>
        <button type="button" :aria-label="`Sever connection: ${edge.connection.meaning}`" @click.stop="removeConnection(edge.connection.id)">
          ×
        </button>
      </div>

      <template v-for="artifact in topLevelArtifacts" :key="`breathe-${artifact.id}`">
        <button
          v-if="staleArtifactIds.includes(artifact.id) && regeneratingArtifactId !== artifact.id && !deletingArtifactIds.includes(artifact.id)"
          class="breathe-badge"
          type="button"
          :aria-label="`Let ${artifact.title} absorb its changed connections`"
          :style="{ left: `${artifactCenter(artifact).x}px`, top: `${artifact.y - 20}px` }"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @click.stop="breatheArtifact(artifact)"
        >
          <span>breathe</span>
        </button>
      </template>

      <template v-if="selectedTopLevelArtifact && suggestionsLoadingId === selectedTopLevelArtifact.id && !activeSuggestions.length">
        <span
          v-for="seedIndex in 3"
          :key="`seed-${seedIndex}`"
          class="ghost-seed"
          :style="{
            left: `${ghostSuggestionPosition(selectedTopLevelArtifact, seedIndex - 1, 3).x}px`,
            top: `${ghostSuggestionPosition(selectedTopLevelArtifact, seedIndex - 1, 3).y}px`,
            '--ghost-delay': `${(seedIndex - 1) * 240}ms`,
          }"
        />
      </template>

      <button
        v-for="(suggestion, index) in activeSuggestions"
        :key="`${activeSuggestionArtifact?.id}-${suggestion.title}`"
        class="ghost-suggestion"
        :class="{
          'ghost-suggestion--queued': queuedSuggestionKeys.includes(suggestionKey(activeSuggestionArtifact!.id, suggestion)),
          'ghost-suggestion--creating':
            creatingSuggestionKey === `${activeSuggestionArtifact?.id}:batch` &&
            queuedSuggestionKeys.includes(suggestionKey(activeSuggestionArtifact!.id, suggestion)),
          'ghost-suggestion--waiting':
            creatingSuggestionKey &&
            !(creatingSuggestionKey === `${activeSuggestionArtifact?.id}:batch` && queuedSuggestionKeys.includes(suggestionKey(activeSuggestionArtifact!.id, suggestion))),
        }"
        type="button"
        :title="suggestion.reason"
        :aria-label="`Queue suggested artifact: ${suggestion.title}`"
        :style="{
          left: `${ghostSuggestionPosition(activeSuggestionArtifact!, index, activeSuggestions.length).x}px`,
          top: `${ghostSuggestionPosition(activeSuggestionArtifact!, index, activeSuggestions.length).y}px`,
          '--ghost-delay': `${index * 160}ms`,
        }"
        @pointerdown.stop
        @pointermove.stop
        @pointerup.stop
        @dblclick.stop
        @click.stop="toggleSuggestionQueue(suggestion)"
      >
        <span>{{ suggestion.title }}</span>
        <small>{{ suggestion.kind }}</small>
        <i class="orbit-moon orbit-moon--1" aria-hidden="true" />
        <i class="orbit-moon orbit-moon--2" aria-hidden="true" />
        <i class="orbit-moon orbit-moon--3" aria-hidden="true" />
      </button>

      <button
        v-if="activeSuggestionArtifact && queuedSuggestions.length"
        class="ghost-weave"
        :class="{ 'ghost-weave--creating': creatingSuggestionKey === `${activeSuggestionArtifact.id}:batch` }"
        type="button"
        :disabled="isGenerating"
        :title="`Create ${queuedSuggestions.length} queued suggestions`"
        :aria-label="`Weave ${queuedSuggestions.length} queued suggested artifacts`"
        :style="{
          left: `${ghostWeavePosition(activeSuggestionArtifact).x}px`,
          top: `${ghostWeavePosition(activeSuggestionArtifact).y}px`,
        }"
        @pointerdown.stop
        @pointermove.stop
        @pointerup.stop
        @dblclick.stop
        @click.stop="executeQueuedSuggestions"
      >
        <span>weave {{ queuedSuggestions.length }}</span>
        <small>make these together</small>
      </button>

      <button
        class="seed-dot"
        :class="dotClass"
        :style="{ left: `${dot.x}px`, top: `${dot.y}px` }"
        type="button"
        aria-label="Create from this point"
        @pointerdown="handleDotPointerDown"
        @pointermove="handleDotPointerMove"
        @pointerup="handleDotPointerUp"
      >
        <span class="seed-dot__core" />
        <i class="orbit-moon orbit-moon--1" aria-hidden="true" />
        <i class="orbit-moon orbit-moon--2" aria-hidden="true" />
        <i class="orbit-moon orbit-moon--3" aria-hidden="true" />
      </button>
    </div>

    <button v-if="deletedMarkers.length" class="marker-control" type="button" @pointerdown.stop @click="clearDeletedMarkers">
      clear deleted dots
    </button>

    <div class="theme-dots" @pointerdown.stop @pointerup.stop @dblclick.stop>
      <button
        v-for="name in THEMES"
        :key="name"
        class="theme-dot"
        :class="[`theme-dot--${name}`, { 'theme-dot--active': theme === name }]"
        type="button"
        :title="name"
        :aria-label="`Switch to ${name} theme`"
        :aria-pressed="theme === name"
        @click="theme = name"
      />
    </div>

    <div class="model-dock" @pointerdown.stop @pointermove.stop @pointerup.stop @dblclick.stop @wheel.stop>
      <button
        class="generation-status generation-status--button"
        type="button"
        aria-label="Choose AI models"
        :aria-expanded="isModelPickerOpen"
        @click="toggleModelPicker"
      >
        {{ statusLabel }}
      </button>

      <div v-if="isModelPickerOpen" class="model-picker" aria-label="Model selection">
        <template v-if="modelCatalog">
          <div class="model-picker__group" aria-label="Artifact generation models">
            <small>artifacts</small>
            <button
              v-for="option in modelCatalog.textModels"
              :key="option.id"
              type="button"
              class="model-picker__option"
              :class="{ 'model-picker__option--active': option.id === currentTextModelId }"
              :title="option.id"
              @click="selectTextModel(option.id)"
            >
              <span>{{ shortModelName(option.id) }}</span>
              <small>{{ formatModelPrice(option) }}</small>
            </button>
          </div>

          <div class="model-picker__group" aria-label="Image generation models">
            <small>images</small>
            <button
              v-for="option in modelCatalog.imageModels"
              :key="option.id"
              type="button"
              class="model-picker__option"
              :class="{ 'model-picker__option--active': option.id === currentImageModelId }"
              :title="option.id"
              @click="selectImageModel(option.id)"
            >
              <span>{{ shortModelName(option.id) }}</span>
              <small v-if="option.id.endsWith(':free')">free</small>
            </button>
          </div>
        </template>

        <p v-else class="model-picker__empty">model catalog unavailable</p>
      </div>
    </div>

    <div class="canvas-help">
      <button class="canvas-help__trigger" type="button" aria-label="Show canvas controls">?</button>
      <div class="canvas-help__panel" role="tooltip">
        <span>wheel zoom</span>
        <span>drag background pan</span>
        <span>select + halo weave</span>
        <span>tendrils carry values</span>
        <span>breathe absorbs changes</span>
        <span>F fit</span>
        <span>0 reset</span>
      </div>
    </div>

    <aside
      v-if="inspectedArtifact"
      ref="inspectorPanel"
      class="inspector-panel"
      :class="{ 'inspector-panel--dragging': Boolean(inspectorDragState) }"
      :style="inspectorStyle"
      aria-label="Artifact inspector"
      @pointerdown.stop
    >
      <div class="inspector-panel__actions" @pointerdown.stop>
        <button
          class="inspector-panel__icon inspector-panel__icon--remove"
          type="button"
          aria-label="Remove artifact"
          title="Remove artifact"
          @click="deleteArtifact(inspectedArtifact)"
        >
          ×
        </button>
        <button class="inspector-panel__icon" type="button" aria-label="Close inspector" @click="closeInspector">×</button>
      </div>

      <div
        class="inspector-panel__header"
        @pointerdown="handleInspectorPointerDown"
        @pointermove="handleInspectorPointerMove"
        @pointerup="handleInspectorPointerUp"
        @pointercancel="handleInspectorPointerUp"
      >
        <div class="inspector-panel__eyebrow">inspect</div>
        <h2>{{ inspectedArtifact.title }}</h2>
      </div>

      <dl>
        <div>
          <dt>type</dt>
          <dd>{{ inspectedArtifact.kind }}</dd>
        </div>
        <div>
          <dt>created</dt>
          <dd>{{ inspectedArtifact.createdAt }}</dd>
        </div>
        <div>
          <dt>prompt</dt>
          <dd>{{ inspectedArtifact.prompt }}</dd>
        </div>
        <div>
          <dt>purpose</dt>
          <dd>{{ inspectedArtifact.content.purpose ?? '—' }}</dd>
        </div>
        <div>
          <dt>parent</dt>
          <dd>{{ getParentArtifact(inspectedArtifact)?.title ?? 'canvas' }}</dd>
        </div>
        <div>
          <dt>contains</dt>
          <dd>{{ getChildArtifacts(inspectedArtifact.id).length }}</dd>
        </div>
      </dl>

      <form class="inspector-panel__edit" @submit.prevent="submitInspectorEdit">
        <input
          v-model="inspectorEditPrompt"
          :disabled="isInspectorEditDisabled"
          type="text"
          placeholder="change this artifact, or leave empty to regenerate"
          autocomplete="off"
        />
        <button type="submit" :disabled="isInspectorEditDisabled">
          {{ inspectorEditActionLabel }}
        </button>
      </form>

      <pre>{{ inspectedArtifactRaw }}</pre>
    </aside>

    <form
      class="command-bar"
      :class="{ 'command-bar--visible': isDotActive || (isGenerating && !creatingSuggestionKey) }"
      @submit.prevent="submitPrompt"
    >
      <div class="command-bar__status">
        <span class="command-bar__dot" />
        <span>{{ isGenerating ? 'shaping...' : promptMode.type === 'edit' ? 'artifact is listening' : 'origin is listening' }}</span>
      </div>
      <input ref="promptInput" v-model="prompt" :disabled="isGenerating" :placeholder="promptPlaceholder" autocomplete="off" />
      <button type="submit" :disabled="isPromptSubmitDisabled">
        {{ promptActionLabel }}
      </button>
    </form>
  </main>
</template>
