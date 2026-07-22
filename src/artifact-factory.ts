import { ARTIFACT_HEIGHT, ARTIFACT_WIDTH } from './constants';
import type { Artifact, ArtifactContent, ArtifactKind, ArtifactPorts, GeneratedArtifact, Point } from './types';

export function nowLabel() {
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

export function cloneArtifact(artifact: Artifact): Artifact {
  return JSON.parse(JSON.stringify(artifact)) as Artifact;
}

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizePorts(ports?: ArtifactPorts): ArtifactPorts {
  return {
    inputs: ports?.inputs ?? [],
    outputs: ports?.outputs ?? [],
  };
}

export function makeArtifactTitle(value: string) {
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

export function detectArtifactKind(value: string, fallback: ArtifactKind = 'unknown'): ArtifactKind {
  const text = value.toLowerCase();

  if (/\b(html|javascript|js|interactive|component|button|form|screen|page|ui|widget|vue|react|counter|calculator)\b/.test(text)) return 'component';
  if (/\b(image|picture|photo|illustration|logo|icon|poster|visual|wallpaper)\b/.test(text)) return 'image';
  if (/\b(video|movie|clip|animation|trailer)\b/.test(text)) return 'video';
  if (/\b(text|copy|poem|story|essay|markdown|explain|write|article|headline)\b/.test(text)) return 'text';
  if (/\b(card|plan|schedule|list|game|condition|rule|data|table|routine|inventory)\b/.test(text)) return 'object';

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
    ports: normalizePorts(),
  };
}

function createComponentArtifactContent(value: string): ArtifactContent {
  const title = makeArtifactTitle(value);
  const encodedTitle = JSON.stringify(title).replace(/</g, '\\u003c');
  const vue = `<template>
  <div class="dot-demo">
    <span class="eyebrow">living counter</span>
    <h3>{{ title }}</h3>
    <button @click="increment">grow</button>
    <p>{{ count ? 'Grown to ' + count + '.' : 'Ready to grow.' }}</p>
    <small>seed · {{ seed }}</small>
  </div>
</template>

<script>
const { computed, onMounted, reactive, ref, watch } = Vue;

// Dot is injected by the canvas. These local defaults keep the component fully
// usable in a standalone preview and in snapshots created before Dot existed.
const fallbackInputs = reactive({ seed: 0 });
const dot = globalThis.Dot ?? { inputs: fallbackInputs, emit: () => {} };
const dotInputs = dot.inputs ?? fallbackInputs;
const emitDot = typeof dot.emit === 'function' ? dot.emit.bind(dot) : () => {};

export default {
  setup() {
    const title = ${encodedTitle};
    const seed = computed(() => {
      const next = Number(dotInputs.seed);
      return Number.isFinite(next) ? next : 0;
    });
    const count = ref(seed.value);

    watch(seed, (next) => {
      count.value = next;
    });

    function increment() {
      count.value += 1;
      emitDot('count', count.value);
    }

    onMounted(() => emitDot('count', count.value));

    return { count, increment, seed, title };
  },
};
</script>

<style>
.dot-demo { display: grid; gap: 12px; min-height: 150px; place-items: center; padding: 18px; color: #fffaf0; background: radial-gradient(circle at 30% 20%, rgba(142,255,135,.22), transparent 38%), #151711; border-radius: 20px; font-family: system-ui, sans-serif; }
button { border: 0; border-radius: 999px; padding: 10px 14px; background: #ffbc75; color: #15110b; font-weight: 800; cursor: pointer; }
p, h3 { margin: 0; }
.eyebrow, small { color: rgba(255, 250, 240, .6); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
</style>`;

  return {
    raw: vue,
    description: value,
    vue,
    tags: ['component', 'vue'],
    connections: ['seed', 'count', 'growth'],
    capabilities: ['render', 'interact', 'connect'],
    summary: 'Sandboxed Vue component with a live seed input and count output.',
    ports: {
      inputs: [{ id: 'seed', label: 'seed', type: 'data', mode: 'state', purpose: 'Sets the counter to a connected numeric starting value.' }],
      outputs: [{ id: 'count', label: 'count', type: 'data', mode: 'state', purpose: 'Emits the current count whenever the user grows it.' }],
    },
  };
}

export function fakeGenerateArtifact(value: string, previous?: Artifact, preferredKind?: ArtifactKind): GeneratedArtifact {
  const kind = detectArtifactKind(value, preferredKind ?? previous?.kind ?? 'unknown');
  const title = previous ? makeArtifactTitle(`${previous.title} · ${value}`) : makeArtifactTitle(value);

  if (kind === 'text') {
    const markdown = previous
      ? `### ${previous.title}\n\n${value}\n\nThis is the next written version of the artifact. The real generator will preserve intent, voice, and structure.`
      : `### ${title}\n\n${value}\n\nThis is a structured text artifact placeholder.`;

    return {
      kind,
      title,
      purpose: 'Readable generated content.',
      summary: 'Text artifact with markdown preview.',
      content: {
        raw: markdown,
        markdown,
        tags: ['text'],
        connections: ['source', 'reference', 'output'],
        capabilities: ['summarise', 'rewrite', 'connect'],
        summary: 'Text artifact with markdown preview.',
        ports: {
          inputs: [{ id: 'source', label: 'source', type: 'text', mode: 'resource', purpose: 'Source text or instructions.' }],
          outputs: [{ id: 'text', label: 'text', type: 'text', mode: 'resource', purpose: 'Generated written output.' }],
        },
      },
    };
  }

  if (kind === 'component') {
    return {
      kind,
      title,
      purpose: 'Interactive generated component.',
      summary: 'Sandboxed Vue component.',
      content: createComponentArtifactContent(value),
    };
  }

  if (kind === 'object') {
    return {
      kind,
      title,
      purpose: 'Semantic canvas object.',
      summary: 'Universal object shell.',
      content: createObjectArtifactContent(value),
    };
  }

  if (kind === 'image') {
    return {
      kind,
      title,
      purpose: 'Image generation specification.',
      summary: 'Image artifact placeholder.',
      content: {
        raw: `Image prompt: ${value}`,
        description: value,
        imagePrompt: value,
        alt: `Generated image placeholder for: ${value}`,
        tags: ['visual'],
        connections: ['reference', 'style', 'output'],
        capabilities: ['describe', 'vary', 'connect'],
        summary: 'Image artifact placeholder.',
        ports: {
          inputs: [{ id: 'style', label: 'style', type: 'text', mode: 'resource', purpose: 'Visual style or reference.' }],
          outputs: [{ id: 'image', label: 'image', type: 'image', mode: 'resource', purpose: 'Generated image output.' }],
        },
      },
    };
  }

  if (kind === 'video') {
    return {
      kind,
      title,
      purpose: 'Video generation specification.',
      summary: 'Video artifact placeholder with storyboard beats.',
      content: {
        raw: `Video prompt: ${value}`,
        description: value,
        tags: ['motion'],
        connections: ['scene', 'timing', 'audio', 'output'],
        capabilities: ['storyboard', 'vary', 'connect'],
        storyboard: ['Opening frame', 'Main motion', 'End frame'],
        summary: 'Video artifact placeholder with storyboard beats.',
        ports: {
          inputs: [{ id: 'script', label: 'script', type: 'text', mode: 'resource', purpose: 'Scene or script input.' }],
          outputs: [{ id: 'video', label: 'video', type: 'video', mode: 'resource', purpose: 'Generated video output.' }],
        },
      },
    };
  }

  return {
    kind,
    title,
    purpose: 'Unclassified generated object.',
    summary: 'Unknown artifact type. This will later be resolved by the model router.',
    content: {
      raw: value,
      tags: ['unclassified'],
      connections: ['source', 'meaning', 'output'],
      capabilities: ['classify', 'transform', 'connect'],
      summary: 'Unknown artifact type. This will later be resolved by the model router.',
      ports: normalizePorts(),
    },
  };
}

export function createArtifactFromGenerated(generated: GeneratedArtifact, prompt: string, position: Point, parentId?: string): Artifact {
  const content = generated.content ?? { raw: prompt };
  const ports = generated.ports ?? content.ports ?? normalizePorts();
  const summary = generated.summary ?? content.summary ?? content.description ?? content.raw;
  const purpose = generated.purpose ?? content.purpose ?? summary;

  return {
    id: crypto.randomUUID(),
    kind: generated.kind,
    title: makeArtifactTitle(generated.title || prompt),
    prompt,
    x: position.x,
    y: position.y,
    width: ARTIFACT_WIDTH,
    height: ARTIFACT_HEIGHT,
    createdAt: nowLabel(),
    content: {
      ...content,
      raw: content.raw || content.markdown || content.description || content.text || summary || prompt,
      description: content.description || summary,
      summary,
      purpose,
      ports,
      capabilities: content.capabilities ?? ['inspect', 'prompt', 'fork', 'connect'],
      connections: content.connections ?? [...ports.inputs.map((port) => port.label), ...ports.outputs.map((port) => port.label)].slice(0, 6),
      tags: content.tags ?? [generated.kind],
    },
    parentId,
  };
}

export function createArtifactFromPrompt(value: string, position: Point): Artifact {
  return createArtifactFromGenerated(fakeGenerateArtifact(value), value, position);
}
