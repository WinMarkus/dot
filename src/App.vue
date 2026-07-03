<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { createArtifactFromPrompt, cloneArtifact, fakeGenerateArtifact, nowLabel } from './artifact-factory';
import {
  canNestArtifact as canNestArtifactInTree,
  getArtifactRenderHeight as getArtifactTreeRenderHeight,
  getChildArtifacts as getTreeChildArtifacts,
  getParentArtifact as getTreeParentArtifact,
} from './artifact-tree';
import { ARTIFACT_HEIGHT, ARTIFACT_WIDTH, DELETE_TRANSITION_MS, MIN_ZOOM } from './constants';
import {
  centerCameraOn as createCenteredCamera,
  clamp,
  getViewportSafeWorldPoint,
  screenToWorld as convertScreenToWorld,
  worldToScreen as convertWorldToScreen,
  zoomCameraAt,
} from './geometry';
import type { Artifact, CameraState, DeletedMarker, DragState, Point, PromptMode, Viewport } from './types';

const dot = ref<Point>({ x: 0, y: 0 });
const camera = ref<CameraState>({ x: 0, y: 0, zoom: 1 });
const isDotActive = ref(false);
const isGenerating = ref(false);
const regeneratingArtifactId = ref<string | null>(null);
const prompt = ref('');
const promptMode = ref<PromptMode>({ type: 'create' });
const promptInput = ref<HTMLInputElement | null>(null);

const artifacts = ref<Artifact[]>([]);
const deletingArtifactIds = ref<string[]>([]);
const deletedMarkers = ref<DeletedMarker[]>([]);
const deletionTimers = new Map<string, number>();

const selectedArtifactId = ref<string | null>(null);
const activeActionArtifactId = ref<string | null>(null);
const inspectedArtifactId = ref<string | null>(null);
const dropTargetArtifactId = ref<string | null>(null);

const dotDragState = ref<DragState | null>(null);
const artifactDragState = ref<(DragState & { artifactId: string }) | null>(null);
const panState = ref<DragState | null>(null);

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

const isPromptSubmitDisabled = computed(() => {
  if (isGenerating.value || regeneratingArtifactId.value) return true;
  if (promptMode.value.type === 'create') return !prompt.value.trim();
  return false;
});

const inspectedArtifact = computed(() =>
  artifacts.value.find((artifact) => artifact.id === inspectedArtifactId.value) ?? null,
);

const inspectedArtifactRaw = computed(() =>
  inspectedArtifact.value ? JSON.stringify(inspectedArtifact.value.content, null, 2) : '',
);

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

function chooseArtifactPosition(seed: Point) {
  const viewport = getViewport();
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
      screen.x + width <= viewport.width - margin &&
      screen.y + height <= viewport.height - reservedBottom
    );
  });

  return fittingCandidate ?? getViewportSafeWorldPoint({ x: margin, y: margin + 24 }, camera.value, viewport);
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
  selectedArtifactId.value = null;
  activeActionArtifactId.value = null;
  inspectedArtifactId.value = null;
  dropTargetArtifactId.value = null;

  if (!isGenerating.value && !regeneratingArtifactId.value) {
    isDotActive.value = false;
    resetPromptMode();
  }
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
}

function extractNestedArtifact(child: Artifact, parent: Artifact, index: number) {
  child.parentId = undefined;
  child.x = parent.x + 28 + index * 18;
  child.y = parent.y + getArtifactRenderHeight(parent) + 24;
  selectedArtifactId.value = child.id;
  activeActionArtifactId.value = null;
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

function handleWorkspacePointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.command-bar, .canvas-help, .inspector-panel, .deleted-marker, .marker-control, .nested-bubbles')) return;

  closeTransientUi();

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

  if (!state.moved) {
    dot.value = screenToWorld({ x: state.startPointerX, y: state.startPointerY });
  }
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
  if (deletingArtifactIds.value.includes(artifact.id)) return;

  inspectedArtifactId.value = artifact.id;
  selectedArtifactId.value = artifact.id;
  activeActionArtifactId.value = null;
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
  fork.x = artifact.x + 48;
  fork.y = artifact.y + 48;
  fork.createdAt = nowLabel();
  fork.parentId = undefined;

  artifacts.value.push(fork);
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
  resetCamera();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  deletionTimers.forEach((timerId) => window.clearTimeout(timerId));
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

      <section
        v-for="artifact in topLevelArtifacts"
        :key="artifact.id"
        class="artifact-card"
        :class="{
          'artifact-card--dragging': artifactDragState?.artifactId === artifact.id,
          'artifact-card--selected': selectedArtifactId === artifact.id,
          'artifact-card--regenerating': regeneratingArtifactId === artifact.id,
          'artifact-card--deleting': deletingArtifactIds.includes(artifact.id),
          'artifact-card--nest-target': dropTargetArtifactId === artifact.id,
          'artifact-card--has-children': getChildArtifacts(artifact.id).length,
        }"
        :style="{
          left: `${artifact.x}px`,
          top: `${artifact.y}px`,
          width: `${artifact.width}px`,
          minHeight: `${getArtifactRenderHeight(artifact)}px`,
        }"
        tabindex="0"
        aria-label="Generated artifact. Drag to move."
        @pointerdown="handleArtifactPointerDown($event, artifact)"
        @pointermove="handleArtifactPointerMove"
        @pointerup="handleArtifactPointerUp"
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
        <div>
          <dt>parent</dt>
          <dd>{{ getParentArtifact(inspectedArtifact)?.title ?? 'canvas' }}</dd>
        </div>
        <div>
          <dt>contains</dt>
          <dd>{{ getChildArtifacts(inspectedArtifact.id).length }}</dd>
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
      <button type="submit" :disabled="isPromptSubmitDisabled">
        {{ promptActionLabel }}
      </button>
    </form>
  </main>
</template>
