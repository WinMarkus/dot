<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

type Point = {
  x: number;
  y: number;
};

type Artifact = {
  id: string;
  title: string;
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
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
const ARTIFACT_HEIGHT = 210;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.4;

const dot = ref<Point>({ x: 0, y: 0 });
const camera = ref<CameraState>({ x: 0, y: 0, zoom: 1 });
const isDotActive = ref(false);
const isGenerating = ref(false);
const prompt = ref('');
const artifacts = ref<Artifact[]>([]);
const promptInput = ref<HTMLInputElement | null>(null);
const selectedArtifactId = ref<string | null>(null);

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

  if (fittingCandidate) return fittingCandidate;

  return getViewportSafeWorldPoint({ x: margin, y: margin + 24 });
}

function activatePrompt() {
  if (isGenerating.value) return;

  isDotActive.value = true;
  nextTick(() => promptInput.value?.focus());
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

  dot.value = {
    x: state.startX + dx,
    y: state.startY + dy,
  };
}

function handleDotPointerUp(event: PointerEvent) {
  const state = dotDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const target = event.currentTarget as HTMLElement;
  target.releasePointerCapture(event.pointerId);
  dotDragState.value = null;

  if (!state.moved) {
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

  const target = event.currentTarget as HTMLElement;
  target.releasePointerCapture(event.pointerId);
  artifactDragState.value = null;
}

function handleWorkspacePointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.command-bar, .canvas-help')) return;

  selectedArtifactId.value = null;

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

  camera.value = {
    ...camera.value,
    x: state.startX + dx,
    y: state.startY + dy,
  };
}

function handleWorkspacePointerUp(event: PointerEvent) {
  const state = panState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const target = event.currentTarget as HTMLElement;
  target.releasePointerCapture(event.pointerId);
  panState.value = null;
}

function handleWheel(event: WheelEvent) {
  event.preventDefault();

  const zoomFactor = event.deltaY > 0 ? 0.92 : 1.08;
  zoomAt({ x: event.clientX, y: event.clientY }, camera.value.zoom * zoomFactor);
}

function closePrompt() {
  if (isGenerating.value) return;

  isDotActive.value = false;
  prompt.value = '';
}

function makeArtifactTitle(value: string) {
  const clean = value.trim().replace(/\s+/g, ' ');
  if (!clean) return 'Untitled artifact';

  return clean.length > 42 ? `${clean.slice(0, 39)}...` : clean;
}

async function submitPrompt() {
  const value = prompt.value.trim();
  if (!value || isGenerating.value) return;

  isGenerating.value = true;

  await new Promise((resolve) => window.setTimeout(resolve, 850));

  const position = chooseArtifactPosition(dot.value);

  artifacts.value.push({
    id: crypto.randomUUID(),
    title: makeArtifactTitle(value),
    prompt: value,
    x: position.x,
    y: position.y,
    width: ARTIFACT_WIDTH,
    height: ARTIFACT_HEIGHT,
    createdAt: new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()),
  });

  prompt.value = '';
  isDotActive.value = false;
  isGenerating.value = false;
}

function fitAll() {
  const items = [
    { x: dot.value.x - 16, y: dot.value.y - 16, width: 32, height: 32 },
    ...artifacts.value.map((artifact) => ({
      x: artifact.x,
      y: artifact.y,
      width: artifact.width,
      height: artifact.height,
    })),
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
    closePrompt();
  }

  if (isTyping) return;

  if (event.key.toLowerCase() === 'f') {
    fitAll();
  }

  if (event.key === '0') {
    resetCamera();
  }
}

onMounted(() => {
  resetCamera();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
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
      <section
        v-for="artifact in artifacts"
        :key="artifact.id"
        class="artifact-card"
        :class="{
          'artifact-card--dragging': artifactDragState?.artifactId === artifact.id,
          'artifact-card--selected': selectedArtifactId === artifact.id,
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
          aria-label="Artifact actions"
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
          @click.stop
        >
          <button class="artifact-action-root" type="button" aria-label="Show artifact actions">
            <span />
          </button>
          <button class="artifact-action artifact-action--inspect" type="button" data-label="inspect" aria-label="Inspect artifact">
            i
          </button>
          <button class="artifact-action artifact-action--edit" type="button" data-label="prompt" aria-label="Prompt this artifact">
            ✎
          </button>
          <button class="artifact-action artifact-action--fork" type="button" data-label="fork" aria-label="Fork artifact">
            ⟡
          </button>
        </div>

        <div class="artifact-card__eyebrow">generated {{ artifact.createdAt }}</div>
        <h2>{{ artifact.title }}</h2>
        <p>{{ artifact.prompt }}</p>
        <div class="artifact-card__footer">
          <span>mock artifact</span>
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

    <div class="canvas-help">
      <button class="canvas-help__trigger" type="button" aria-label="Show canvas controls">?</button>
      <div class="canvas-help__panel" role="tooltip">
        <span>wheel zoom</span>
        <span>drag background pan</span>
        <span>F fit</span>
        <span>0 reset</span>
      </div>
    </div>

    <form
      class="command-bar"
      :class="{ 'command-bar--visible': isDotActive || isGenerating }"
      @submit.prevent="submitPrompt"
    >
      <div class="command-bar__status">
        <span class="command-bar__dot" />
        <span>{{ isGenerating ? 'shaping...' : 'origin is listening' }}</span>
      </div>
      <input
        ref="promptInput"
        v-model="prompt"
        :disabled="isGenerating"
        placeholder="what do we want to build today?"
        autocomplete="off"
      />
      <button type="submit" :disabled="!prompt.trim() || isGenerating">
        {{ isGenerating ? 'creating' : 'create' }}
      </button>
    </form>
  </main>
</template>
