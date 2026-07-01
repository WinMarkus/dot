<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

type Artifact = {
  id: string;
  title: string;
  prompt: string;
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

const dot = ref({ x: 0, y: 0 });
const isDotActive = ref(false);
const isGenerating = ref(false);
const prompt = ref('');
const artifacts = ref<Artifact[]>([]);
const promptInput = ref<HTMLInputElement | null>(null);

const dotDragState = ref<DragState | null>(null);
const artifactDragState = ref<(DragState & { artifactId: string }) | null>(null);

const dotClass = computed(() => ({
  'seed-dot--active': isDotActive.value,
  'seed-dot--generating': isGenerating.value,
}));

function centerDot() {
  dot.value = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getArtifactBounds() {
  const padding = 20;
  const width = Math.min(320, window.innerWidth - padding * 2);
  const height = 210;

  return {
    padding,
    width,
    height,
    maxX: Math.max(padding, window.innerWidth - width - padding),
    maxY: Math.max(padding, window.innerHeight - height - padding),
  };
}

function getSafeArtifactPosition(x: number, y: number) {
  const bounds = getArtifactBounds();

  return {
    x: clamp(x, bounds.padding, bounds.maxX),
    y: clamp(y, bounds.padding, bounds.maxY),
  };
}

function activatePrompt() {
  if (isGenerating.value) return;

  isDotActive.value = true;
  nextTick(() => promptInput.value?.focus());
}

function handleDotPointerDown(event: PointerEvent) {
  if (isGenerating.value) return;

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

  const dx = event.clientX - state.startPointerX;
  const dy = event.clientY - state.startPointerY;

  if (Math.abs(dx) + Math.abs(dy) > 4) {
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

  const dx = event.clientX - state.startPointerX;
  const dy = event.clientY - state.startPointerY;

  if (Math.abs(dx) + Math.abs(dy) > 4) {
    state.moved = true;
  }

  const artifact = artifacts.value.find((item) => item.id === state.artifactId);
  if (!artifact) return;

  const nextPosition = getSafeArtifactPosition(state.startX + dx, state.startY + dy);
  artifact.x = nextPosition.x;
  artifact.y = nextPosition.y;
}

function handleArtifactPointerUp(event: PointerEvent) {
  const state = artifactDragState.value;
  if (!state || state.pointerId !== event.pointerId) return;

  const target = event.currentTarget as HTMLElement;
  target.releasePointerCapture(event.pointerId);
  artifactDragState.value = null;
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

  const position = getSafeArtifactPosition(dot.value.x + 34, dot.value.y - 28);

  artifacts.value.push({
    id: crypto.randomUUID(),
    title: makeArtifactTitle(value),
    prompt: value,
    x: position.x,
    y: position.y,
    createdAt: new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()),
  });

  prompt.value = '';
  isDotActive.value = false;
  isGenerating.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closePrompt();
  }
}

onMounted(() => {
  centerDot();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <main class="workspace" aria-label="Dot creation canvas">
    <div class="ambient ambient--one" />
    <div class="ambient ambient--two" />

    <section
      v-for="artifact in artifacts"
      :key="artifact.id"
      class="artifact-card"
      :class="{ 'artifact-card--dragging': artifactDragState?.artifactId === artifact.id }"
      :style="{ left: `${artifact.x}px`, top: `${artifact.y}px` }"
      tabindex="0"
      aria-label="Generated artifact. Drag to move."
      @pointerdown="handleArtifactPointerDown($event, artifact)"
      @pointermove="handleArtifactPointerMove"
      @pointerup="handleArtifactPointerUp"
    >
      <div class="artifact-card__eyebrow">generated {{ artifact.createdAt }}</div>
      <h2>{{ artifact.title }}</h2>
      <p>{{ artifact.prompt }}</p>
      <div class="artifact-card__footer">
        <span>mock artifact</span>
        <button type="button" @pointerdown.stop>inspect</button>
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
