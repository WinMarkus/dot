<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

type Point = { x: number; y: number };
type ArtifactKind = 'text' | 'object' | 'image' | 'video' | 'unknown';
type PromptMode = { type: 'create' } | { type: 'edit'; artifactId: string };

type ArtifactFacet = {
  label: string;
  value: string;
};

type ArtifactContent = {
  raw: string;
  markdown?: string;
  description?: string;
  tags?: string[];
  capabilities?: string[];
  connections?: string[];
  facets?: ArtifactFacet[];
  alt?: string;
  storyboard?: string[];
  summary?: string;
};

type Artifact = {
  id: string;
  kind: ArtifactKind;
  title: string;
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: string;
  content: ArtifactContent;
};

type GeneratedArtifact = {
  kind: ArtifactKind;
  title: string;
  content: ArtifactContent;
};

type DeletedToast = {
  id: string;
  artifact: Artifact;
  x: number;
  y: number;
  timeoutId: number;
};

type DeletedMarker = {
  id: string;
  artifact: Artifact;
  title: string;
  x: number;
  y: number;
  createdAt: string;
};

type DragState = {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

type CameraState = {
  x: number;
  y: number;
  zoom: number;
};

const ARTIFACT_WIDTH = 320;
const ARTIFACT_HEIGHT = 230;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.4;
const DELETE_UNDO_MS = 5000;

const dot = ref<Point>({ x: 0, y: 0 });
const camera = ref<CameraState>({ x: 0, y: 0, zoom: 1 });
const isDotActive = ref(false);
const isGenerating = ref(false);
const regeneratingArtifactId = ref<string | null>(null);
const prompt = ref('');
const promptMode = ref<PromptMode>({ type: 'create' });
const promptInput = ref<HTMLInputElement | null>(null);

const artifacts = ref<Artifact[]>([]);
const deletedToasts = ref<DeletedToast[]>([]);
const deletedMarkers = ref<DeletedMarker[]>([]);

const selectedArtifactId = ref<string | null>(null);
const activeActionArtifactId = ref<string | null>(null);
const inspectedArtifactId = ref<string | null>(null);

const dotDragState = ref<DragState | null>(null);
const artifactDragState = ref<(DragState & { artifactId: string }) | null>(null);
const panState = ref<DragState | null>(null);

const dotClass = computed(() => ({
  'seed-dot--active': isDotActive.value,
  'seed-dot--generating': isGenerating.value,
}));

const worldTransform = computed(() => ({
  transform: `translate3d(${camera.value.x}px, ${camera.value.y}px, 0) scale(${camera.value.zoom})`,
}));

const gridStyle = computed(() => ({
  backgroundPosition: `${camera.value.x}px ${camera.value.y}px`,
  backgroundSize: `${44 * camera.value.zoom}px ${44 * camera.value.zoom}px`,
}));

const promptPlaceholder = computed(() =>
  promptMode.value.type === 'edit' ? 'what should change about this?' : 'what do we want to build today?',
);

const promptActionLabel = computed(() => {
  if (isGenerating.value) return promptMode.value.type === 'edit' ? 'changing' : 'creating';
  return promptMode.value.type === 'edit' ? 'change' : 'create';
});

const inspectedArtifact = computed(() =>
  artifacts.value.find((artifact) => artifact.id === inspectedArtifactId.value) ?? null,
);

const inspectedArtifactRaw = computed(() =>
  inspectedArtifact.value ? JSON.stringify(inspectedArtifact.value.content, null, 2) : '',
);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function nowLabel() {
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

function cloneArtifact(artifact: Artifact): Artifact {
  return JSON.parse(JSON.stringify(artifact)) as Artifact;
}

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function screenToWorld(point: Point): Point {
  return {
    x: (point.x - camera.value.x) / camera.value.zoom,
    y: (point.y - camera.value.y) / camera.value.zoom,
  };
}

function worldToScreen(point: Point): Point {
  return {
    x: point.x * camera.value.zoom + camera.value.x,
    y: point.y * camera.value.zoom + camera.value.y,
  };
}

function centerCameraOn(point: Point, zoom = camera.value.zoom) {
  camera.value = {
    x: window.innerWidth / 2 - point.x * zoom,
    y: window.innerHeight / 2 - point.y * zoom,
    zoom,
  };
}

function resetCamera() {
  centerCameraOn(dot.value, 1);
}

function zoomAt(screenPoint: Point, nextZoom: number) {
  const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const worldPoint = screenToWorld(screenPoint);

  camera.value = {
    x: screenPoint.x - worldPoint.x * zoom,
    y: screenPoint.y - worldPoint.y * zoom,
    zoom,
  };
}

function getViewportSafeWorldPoint(screenPoint: Point): Point {
  return screenToWorld({
    x: clamp(screenPoint.x, 28, window.innerWidth - 28),
    y: clamp(screenPoint.y, 28, window.innerHeight - 130),
  });
}

function chooseArtifactPosition(seed: Point) {
  const margin = 28;
  const reservedBottom = 132;
  const gap = 42;
  const candidates: Point[] = [
    { x: seed.x + gap, y: seed.y - ARTIFACT_HEIGHT * 0.25 },
    { x: seed.x - ARTIFACT_WIDTH - gap, y: seed.y - ARTIFACT_HEIGHT * 0.25 },
    { x: seed.x - ARTIFACT_WIDTH * 0.5, y: seed.y + gap },
    { x: seed.x - ARTIFACT_WIDTH * 0.5, y: seed.y - ARTIFACT_HEIGHT - gap },
  ];

  const fittingCandidate = candidates.find((candidate) => {
    const screen = worldToScreen(candidate);
    const width = ARTIFACT_WIDTH * camera.value.zoom;
    const height = ARTIFACT_HEIGHT * camera.value.zoom;

    return (
      screen.x >= margin &&
      screen.y >= margin &&
      screen.x + width <= window.innerWidth - margin &&
      screen.y + height <= window.innerHeight - reservedBottom
    );
  });

  return fittingCandidate ?? getViewportSafeWorldPoint({ x: margin, y: margin + 24 });
}

function makeArtifactTitle(value: string) {
  const clean = value.trim().replace(/\s+/g, ' ');
  if (!clean) return 'Untitled artifact';
  return clean.length > 42 ? `${clean.slice(0, 39)}...` : clean;
}

function inferObjectTags(value: string) {
  const text = value.toLowerCase();
  const tags = ['semantic object'];

  if (/\b(list|item|collection|inventory)\b/.test(text)) tags.push('list');
  if (/\b(game|card|condition|rule|turn|score|player|level)\b/.test(text)) tags.push('game logic');
  if (/\b(plan|schedule|week|calendar|reminder|routine)\b/.test(text)) tags.push('plan');
  if (/\b(button|form|screen|page|ui|component|dashboard|modal|widget|vue|react)\b/.test(text)) tags.push('interface');
  if (/\b(data|table|csv|transform|calculate|number)\b/.test(text)) tags.push('data');

  return uniq(tags).slice(0, 4);
}

function inferConnections(value: string) {
  const text = value.toLowerCase();
  const connections = ['source', 'constraint', 'result'];

  if (/\b(list|item|collection|inventory)\b/.test(text)) connections.push('item', 'quantity', 'place');
  if (/\b(game|card|condition|rule)\b/.test(text)) connections.push('trigger', 'state', 'target');
  if (/\b(plan|schedule|week|calendar)\b/.test(text)) connections.push('date', 'task', 'dependency');
  if (/\b(button|form|screen|page|ui|component)\b/.test(text)) connections.push('input', 'event', 'view');

  return uniq(connections).slice(0, 6);
}

function detectArtifactKind(value: string, fallback: ArtifactKind = 'unknown'): ArtifactKind {
  const text = value.toLowerCase();

  if (/\b(image|picture|photo|illustration|logo|icon|poster|visual|wallpaper)\b/.test(text)) return 'image';
  if (/\b(video|movie|clip|animation|trailer)\b/.test(text)) return 'video';
  if (/\b(text|copy|poem|story|essay|markdown|explain|write|article|headline)\b/.test(text)) return 'text';
  if (/\b(component|button|card|form|login|dashboard|widget|ui|vue|react|page|modal|plan|schedule|list|game|condition|rule|data|table|routine)\b/.test(text)) return 'object';

  return fallback;
}

function createObjectArtifactContent(value: string): ArtifactContent {
  return {
    raw: value,
    description: value,
    tags: inferObjectTags(value),
    connections: inferConnections(value),
    capabilities: ['accepts detail', 'can connect', 'can transform'],
    facets: [
      { label: 'role', value: 'semantic object' },
      { label: 'state', value: 'draft' },
    ],
    summary: 'Universal artifact shell. Meaning, capabilities, and connections are model-defined.',
  };
}

function fakeGenerateArtifact(value: string, previous?: Artifact): GeneratedArtifact {
  const kind = detectArtifactKind(value, previous?.kind ?? 'unknown');
  const title = previous ? makeArtifactTitle(`${previous.title} · ${value}`) : makeArtifactTitle(value);

  if (kind === 'text') {
    const markdown = previous
      ? `### ${previous.title}\n\n${value}\n\nThis is the next written version of the artifact. The real generator will preserve intent, voice, and structure.`
      : `### ${title}\n\n${value}\n\nThis is a structured text artifact placeholder.`;

    return {
      kind,
      title,
      content: {
        raw: markdown,
        markdown,
        tags: ['text'],
        connections: ['source', 'reference', 'output'],
        capabilities: ['summarise', 'rewrite', 'connect'],
        summary: 'Text artifact with markdown preview.',
      },
    };
  }

  if (kind === 'object') {
    return {
      kind,
      title,
      content: createObjectArtifactContent(value),
    };
  }

  if (kind === 'image') {
    return {
      kind,
      title,
      content: {
        raw: `Image prompt: ${value}`,
        description: value,
        alt: `Generated image placeholder for: ${value}`,
        tags: ['visual'],
        connections: ['reference', 'style', 'output'],
        capabilities: ['describe', 'vary', 'connect'],
        summary: 'Image artifact placeholder.',
      },
    };
  }

  if (kind === 'video') {
    return {
      kind,
      title,
      content: {
        raw: `Video prompt: ${value}`,
        description: value,
        tags: ['motion'],
        connections: ['scene', 'timing', 'audio', 'output'],
        capabilities: ['storyboard', 'vary', 'connect'],
        storyboard: ['Opening frame', 'Main motion', 'End frame'],
        summary: 'Video artifact placeholder with storyboard beats.',
      },
    };
  }

  return {
    kind,
    title,
    content: {
      raw: value,
      tags: ['unclassified'],
      connections: ['source', 'meaning', 'output'],
      capabilities: ['classify', 'transform', 'connect'],
      summary: 'Unknown artifact type. This will later be resolved by the model router.',
    },
  };
}

function createArtifactFromPrompt(value: string, position: Point): Artifact {
  const generated = fakeGenerateArtifact(value);

  return {
    id: crypto.randomUUID(),
    kind: generated.kind,
    title: generated.title,
    prompt: value,
    x: position.x,
    y: position.y,
    width: ARTIFACT_WIDTH,
    height: ARTIFACT_HEIGHT,
    createdAt: nowLabel(),
    content: generated.content,
  };
}

function activatePrompt() {
  if (isGenerating.value) return;
  isDotActive.value = true;
  nextTick(() => promptInput.value?.focus());
}

function resetPromptMode() {
  promptMode.value = { type: 'create' };
  prompt.value = '';
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
  event.stopPropagation();
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

function handleArtifactPointerMove(event: PointerEvent) {
  const state = artifactDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const dx = (event.clientX - state.startPointerX) / camera.value.zoom;
  const dy = (event.clientY - state.startPointerY) / camera.value.zoom;

  if (Math.abs(event.clientX - state.startPointerX) + Math.abs(event.clientY - state.startPointerY) > 4) {
    state.moved = true;
  }

  const artifact = artifacts.value.find((item) => item.id === state.artifactId);
  if (!artifact) return;

  artifact.x = state.startX + dx;
  artifact.y = state.startY + dy;
}

function handleArtifactPointerUp(event: PointerEvent) {
  const state = artifactDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  artifactDragState.value = null;
}

function handleWorkspacePointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.command-bar, .canvas-help, .inspector-panel, .deleted-toast, .deleted-marker, .marker-control')) return;

  selectedArtifactId.value = null;
  activeActionArtifactId.value = null;

  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);

  panState.value = {
    pointerId: event.pointerId,
    startPointerX: event.clientX,
    startPointerY: event.clientY,
    startX: camera.value.x,
    startY: camera.value.y,
    moved: false,
  };
}

function handleWorkspacePointerMove(event: PointerEvent) {
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
  const state = panState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  panState.value = null;
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();
  zoomAt({ x: event.clientX, y: event.clientY }, camera.value.zoom * (event.deltaY > 0 ? 0.92 : 1.08));
}

function closePrompt() {
  if (isGenerating.value) return;
  isDotActive.value = false;
  resetPromptMode();
}

async function regenerateArtifact(artifact: Artifact) {
  if (regeneratingArtifactId.value) return;

  regeneratingArtifactId.value = artifact.id;
  activeActionArtifactId.value = null;

  await new Promise((resolve) => window.setTimeout(resolve, 850));

  const current = artifacts.value.find((item) => item.id === artifact.id);
  if (current) {
    const generated = fakeGenerateArtifact(current.prompt);
    current.kind = generated.kind;
    current.title = generated.title;
    current.content = generated.content;
    selectedArtifactId.value = current.id;
  }

  regeneratingArtifactId.value = null;
}

function regenerateCurrentEditArtifact() {
  const mode = promptMode.value;
  if (mode.type !== 'edit') return;

  const artifact = artifacts.value.find((item) => item.id === mode.artifactId);
  if (artifact) {
    regenerateArtifact(artifact);
  }
}

async function submitPrompt() {
  const value = prompt.value.trim();
  if (!value || isGenerating.value) return;

  const mode = promptMode.value;
  isGenerating.value = true;

  await new Promise((resolve) => window.setTimeout(resolve, 850));

  if (mode.type === 'edit') {
    const artifact = artifacts.value.find((item) => item.id === mode.artifactId);
    if (artifact) {
      const generated = fakeGenerateArtifact(value, artifact);
      artifact.kind = generated.kind;
      artifact.title = generated.title;
      artifact.prompt = value;
      artifact.content = generated.content;
      selectedArtifactId.value = artifact.id;
    }
  } else {
    const artifact = createArtifactFromPrompt(value, chooseArtifactPosition(dot.value));
    artifacts.value.push(artifact);
    selectedArtifactId.value = artifact.id;
  }

  activeActionArtifactId.value = null;
  isDotActive.value = false;
  isGenerating.value = false;
  resetPromptMode();
}

function inspectArtifact(artifact: Artifact) {
  inspectedArtifactId.value = artifact.id;
  selectedArtifactId.value = artifact.id;
  activeActionArtifactId.value = null;
}

function startPromptArtifact(artifact: Artifact) {
  promptMode.value = { type: 'edit', artifactId: artifact.id };
  prompt.value = '';
  selectedArtifactId.value = artifact.id;
  activeActionArtifactId.value = null;
  activatePrompt();
}

function forkArtifact(artifact: Artifact) {
  const fork = cloneArtifact(artifact);
  fork.id = crypto.randomUUID();
  fork.title = `Fork of ${artifact.title}`;
  fork.x = artifact.x + 48;
  fork.y = artifact.y + 48;
  fork.createdAt = nowLabel();

  artifacts.value.push(fork);
  selectedArtifactId.value = fork.id;
  activeActionArtifactId.value = null;
}

function materializeDeletedMarker(toast: DeletedToast) {
  deletedMarkers.value.push({
    id: crypto.randomUUID(),
    artifact: cloneArtifact(toast.artifact),
    title: toast.artifact.title,
    x: toast.x,
    y: toast.y,
    createdAt: nowLabel(),
  });
  deletedToasts.value = deletedToasts.value.filter((item) => item.id !== toast.id);
}

function deleteArtifact(artifact: Artifact) {
  const removed = cloneArtifact(artifact);
  const toast: DeletedToast = {
    id: crypto.randomUUID(),
    artifact: removed,
    x: artifact.x + artifact.width / 2,
    y: artifact.y + artifact.height / 2,
    timeoutId: 0,
  };

  artifacts.value = artifacts.value.filter((item) => item.id !== artifact.id);
  selectedArtifactId.value = null;
  activeActionArtifactId.value = null;

  if (inspectedArtifactId.value === artifact.id) {
    inspectedArtifactId.value = null;
  }

  toast.timeoutId = window.setTimeout(() => materializeDeletedMarker(toast), DELETE_UNDO_MS);
  deletedToasts.value.push(toast);
}

function undoDelete(toast: DeletedToast) {
  window.clearTimeout(toast.timeoutId);
  artifacts.value.push(toast.artifact);
  deletedToasts.value = deletedToasts.value.filter((item) => item.id !== toast.id);
  selectedArtifactId.value = toast.artifact.id;
}

function revitalizeDeletedMarker(marker: DeletedMarker) {
  const restored = cloneArtifact(marker.artifact);
  artifacts.value.push(restored);
  deletedMarkers.value = deletedMarkers.value.filter((item) => item.id !== marker.id);
  selectedArtifactId.value = restored.id;
  activeActionArtifactId.value = null;
}

function clearDeletedMarkers() {
  deletedMarkers.value = [];
}

function toggleArtifactActions(artifact: Artifact) {
  selectedArtifactId.value = artifact.id;
  activeActionArtifactId.value = activeActionArtifactId.value === artifact.id ? null : artifact.id;
}

function closeInspector() {
  inspectedArtifactId.value = null;
}

function fitAll() {
  const items = [
    { x: dot.value.x - 16, y: dot.value.y - 16, width: 32, height: 32 },
    ...artifacts.value.map((artifact) => ({ x: artifact.x, y: artifact.y, width: artifact.width, height: artifact.height })),
    ...deletedToasts.value.map((toast) => ({ x: toast.x - 80, y: toast.y - 20, width: 160, height: 40 })),
    ...deletedMarkers.value.map((marker) => ({ x: marker.x - 10, y: marker.y - 10, width: 20, height: 20 })),
  ];

  const minX = Math.min(...items.map((item) => item.x));
  const minY = Math.min(...items.map((item) => item.y));
  const maxX = Math.max(...items.map((item) => item.x + item.width));
  const maxY = Math.max(...items.map((item) => item.y + item.height));
  const boundsWidth = Math.max(maxX - minX, 1);
  const boundsHeight = Math.max(maxY - minY, 1);
  const zoom = clamp(
    Math.min((window.innerWidth - 120) / boundsWidth, (window.innerHeight - 220) / boundsHeight),
    MIN_ZOOM,
    1.25,
  );

  camera.value = {
    x: window.innerWidth / 2 - (minX + boundsWidth / 2) * zoom,
    y: window.innerHeight / 2 - (minY + boundsHeight / 2) * zoom,
    zoom,
  };
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

  if (event.key === 'Escape') {
    if (inspectedArtifactId.value) {
      closeInspector();
      return;
    }
    closePrompt();
    activeActionArtifactId.value = null;
  }

  if (isTyping) return;

  if (event.key.toLowerCase() === 'f') fitAll();
  if (event.key === '0') resetCamera();
}

onMounted(() => {
  resetCamera();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  deletedToasts.value.forEach((toast) => window.clearTimeout(toast.timeoutId));
});
</script>

<template>
  <main
    class="workspace"
    :class="{ 'workspace--panning': Boolean(panState) }"
    :style="gridStyle"
    aria-label="Dot creation canvas"
    @pointerdown="handleWorkspacePointerDown"
    @pointermove="handleWorkspacePointerMove"
    @pointerup="handleWorkspacePointerUp"
    @wheel="handleWheel"
  >
    <div class="ambient ambient--one" />
    <div class="ambient ambient--two" />

    <div class="world" :style="worldTransform">
      <button
        v-for="marker in deletedMarkers"
        :key="marker.id"
        class="deleted-marker"
        type="button"
        :title="`Revitalise: ${marker.title}`"
        :aria-label="`Revitalise deleted artifact ${marker.title}`"
        :style="{ left: `${marker.x}px`, top: `${marker.y}px` }"
        @pointerdown.stop
        @click="revitalizeDeletedMarker(marker)"
      >
        <span>revitalise</span>
      </button>

      <div
        v-for="toast in deletedToasts"
        :key="toast.id"
        class="deleted-toast"
        :style="{ left: `${toast.x}px`, top: `${toast.y}px` }"
        @pointerdown.stop
      >
        <span>deleted</span>
        <button type="button" @click="undoDelete(toast)">undo</button>
      </div>

      <section
        v-for="artifact in artifacts"
        :key="artifact.id"
        class="artifact-card"
        :class="{
          'artifact-card--dragging': artifactDragState?.artifactId === artifact.id,
          'artifact-card--selected': selectedArtifactId === artifact.id,
          'artifact-card--regenerating': regeneratingArtifactId === artifact.id,
        }"
        :style="{
          left: `${artifact.x}px`,
          top: `${artifact.y}px`,
          width: `${artifact.width}px`,
          minHeight: `${artifact.height}px`,
        }"
        tabindex="0"
        aria-label="Generated artifact. Drag to move."
        @pointerdown="handleArtifactPointerDown($event, artifact)"
        @pointermove="handleArtifactPointerMove"
        @pointerup="handleArtifactPointerUp"
      >
        <div
          v-if="selectedArtifactId === artifact.id"
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
          <button
            class="artifact-action artifact-action--regenerate"
            type="button"
            data-label="regenerate"
            aria-label="Regenerate artifact"
            :disabled="Boolean(regeneratingArtifactId)"
            @click="regenerateArtifact(artifact)"
          >
            ↻
          </button>
          <button class="artifact-action artifact-action--fork" type="button" data-label="fork" aria-label="Fork artifact" @click="forkArtifact(artifact)">
            ⟡
          </button>
          <button class="artifact-action artifact-action--delete" type="button" data-label="delete" aria-label="Delete artifact" @click="deleteArtifact(artifact)">
            ×
          </button>
        </div>

        <div class="artifact-card__eyebrow">
          {{ regeneratingArtifactId === artifact.id ? 'regenerating' : artifact.kind }} · {{ artifact.createdAt }}
        </div>
        <h2>{{ artifact.title }}</h2>

        <div class="artifact-content" :class="`artifact-content--${artifact.kind}`">
          <template v-if="artifact.kind === 'text'">
            <p>{{ artifact.content.markdown }}</p>
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
                  <small>capabilities</small>
                  <span v-for="capability in artifact.content.capabilities ?? []" :key="capability">{{ capability }}</span>
                </div>
                <div>
                  <small>connections</small>
                  <span v-for="connection in artifact.content.connections ?? []" :key="connection">{{ connection }}</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="artifact.kind === 'image'">
            <div class="image-preview" role="img" :aria-label="artifact.content.alt ?? artifact.title">
              <span />
              <p>{{ artifact.content.description }}</p>
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
      </section>

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
      </button>
    </div>

    <button v-if="deletedMarkers.length" class="marker-control" type="button" @pointerdown.stop @click="clearDeletedMarkers">
      clear deleted dots
    </button>

    <div class="canvas-help">
      <button class="canvas-help__trigger" type="button" aria-label="Show canvas controls">?</button>
      <div class="canvas-help__panel" role="tooltip">
        <span>wheel zoom</span>
        <span>drag background pan</span>
        <span>F fit</span>
        <span>0 reset</span>
      </div>
    </div>

    <aside v-if="inspectedArtifact" class="inspector-panel" aria-label="Artifact inspector" @pointerdown.stop>
      <button class="inspector-panel__close" type="button" aria-label="Close inspector" @click="closeInspector">×</button>
      <div class="inspector-panel__eyebrow">inspect</div>
      <h2>{{ inspectedArtifact.title }}</h2>
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
      </dl>
      <pre>{{ inspectedArtifactRaw }}</pre>
      <button class="inspector-panel__delete" type="button" @click="deleteArtifact(inspectedArtifact)">
        delete artifact
      </button>
    </aside>

    <form class="command-bar" :class="{ 'command-bar--visible': isDotActive || isGenerating }" @submit.prevent="submitPrompt">
      <div class="command-bar__status">
        <span class="command-bar__dot" />
        <span>{{ isGenerating ? 'shaping...' : promptMode.type === 'edit' ? 'artifact is listening' : 'origin is listening' }}</span>
      </div>
      <input ref="promptInput" v-model="prompt" :disabled="isGenerating" :placeholder="promptPlaceholder" autocomplete="off" />
      <button
        v-if="promptMode.type === 'edit'"
        class="command-bar__regenerate"
        type="button"
        :disabled="Boolean(regeneratingArtifactId)"
        @click="regenerateCurrentEditArtifact"
      >
        regenerate
      </button>
      <button type="submit" :disabled="!prompt.trim() || isGenerating">
        {{ promptActionLabel }}
      </button>
    </form>
  </main>
</template>
