import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findComponentRepairTarget,
  inspectComponentArtifact,
  inspectGeneratedArtifacts,
  mergeComponentRepairArtifacts,
  sanitizeVueSource,
} from './component-quality.mjs';
import { inferPreferredKind } from './generation-intent.mjs';

function componentArtifact(vue, overrides = {}) {
  return {
    kind: 'component',
    title: 'Forest relationship atlas',
    purpose: 'Explore a living forest map.',
    summary: 'Five habitats respond to stewardship.',
    content: { vue },
    ports: {
      inputs: [
        { id: 'climate', label: 'climate', type: 'text', mode: 'state', purpose: 'Climate influence.' },
      ],
      outputs: [
        { id: 'forestState', label: 'forest state', type: 'data', mode: 'state', purpose: 'Living state.' },
      ],
    },
    children: [],
    ...overrides,
  };
}

const validComponent = `
<template>
  <main class="world">
    <svg viewBox="0 0 500 300" role="img" aria-label="Five living forest habitats" @pointermove="steer">
      <circle v-for="region in regions" :key="region.id" :cx="region.x" :cy="region.y" :r="18 + region.life" :class="{ active: selected === region.id }" @click="select(region)" tabindex="0" @keydown.enter="select(region)" />
    </svg>
    <button @click="restore">restore habitat</button>
    <button @click="reset">reset world</button>
    <output>{{ healthLabel }} · {{ selected }}</output>
  </main>
</template>
<script>
const { computed, onMounted, reactive, ref, watch } = Vue;
export default {
  setup() {
    const fallbackInputs = reactive({ climate: 'mild' });
    const dot = globalThis.Dot ?? { inputs: fallbackInputs, emit: () => {} };
    const dotInputs = dot.inputs ?? fallbackInputs;
    const emitDot = typeof dot.emit === 'function' ? dot.emit.bind(dot) : () => {};
    const regions = reactive([
      { id: 'grove', x: 70, y: 80, life: 8 },
      { id: 'river', x: 160, y: 160, life: 7 },
      { id: 'ridge', x: 250, y: 85, life: 6 },
      { id: 'meadow', x: 340, y: 170, life: 9 },
      { id: 'village', x: 430, y: 95, life: 5 }
    ]);
    const selected = ref('grove');
    const visits = ref(0);
    const healthLabel = computed(() => dotInputs.climate + ' · ' + regions.reduce((sum, region) => sum + region.life, 0));
    const publish = () => emitDot('forestState', { selected: selected.value, visits: visits.value, climate: dotInputs.climate });
    const select = (region) => { selected.value = region.id; visits.value += 1; region.life += 1; publish(); };
    const restore = () => { const region = regions.find((item) => item.id === selected.value); if (region) region.life += 2; publish(); };
    const reset = () => { selected.value = 'grove'; visits.value = 0; regions.forEach((region) => { region.life = 6; }); publish(); };
    const steer = () => {};
    watch(() => dotInputs.climate, publish);
    onMounted(publish);
    return { regions, selected, healthLabel, select, restore, reset, steer };
  }
};
</script>
<style>
.world { width: 100%; height: 100dvh; min-height: 0; overflow: hidden; display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: clamp(8px, 2vw, 16px); padding: clamp(10px, 3vw, 24px); background: radial-gradient(circle, #294b35, #09120d); }
svg { width: 100%; height: 100%; min-height: 180px; }
circle { fill: #75c96b; stroke: #e8ffd9; cursor: pointer; transition: r .2s ease, fill .2s ease; }
circle.active { fill: #ffd27a; }
button { min-height: 40px; }
button:focus-visible, circle:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
@media (max-width: 480px) { .world { padding: 10px; } }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>`;

test('accepts a substantial, connected, responsive component', () => {
  const report = inspectComponentArtifact(componentArtifact(validComponent));
  assert.equal(report.hardValid, true);
  assert.equal(report.passed, true);
  assert.ok(report.score >= 60);
});

test('does not mistake strings or comments for forbidden JavaScript', () => {
  const withProse = validComponent.replace(
    "const { computed, onMounted, reactive, ref, watch } = Vue;",
    `const { computed, onMounted, reactive, ref, watch } = Vue;
const helpText = 'export data without fetch() or parent access';
// import is documentation here, not executable syntax`,
  );
  const report = inspectComponentArtifact(componentArtifact(withProse));

  assert.equal(report.hardValid, true);
  assert.ok(!report.diagnostics.some((item) => item.code === 'component.script.named_export'));
  assert.ok(!report.diagnostics.some((item) => item.code === 'component.script.import'));
  assert.ok(!report.diagnostics.some((item) => item.code === 'component.script.network'));
  assert.ok(!report.diagnostics.some((item) => item.code === 'component.script.parent_access'));
});

test('allows ordinary top and parent-shaped domain state but rejects actual parent-window access', () => {
  const ordinaryState = validComponent.replace(
    "const { computed, onMounted, reactive, ref, watch } = Vue;",
    `const { computed, onMounted, reactive, ref, watch } = Vue;
const top = ref(10);
const parent = reactive({ children: [] });
top.value += 1;
parent.children.push('seedling');`,
  );
  const validReport = inspectComponentArtifact(componentArtifact(ordinaryState));
  assert.equal(validReport.hardValid, true);
  assert.ok(!validReport.diagnostics.some((item) => item.code === 'component.script.parent_access'));

  const unsafeReport = inspectComponentArtifact(
    componentArtifact(ordinaryState.replace('const top = ref(10);', 'const bridge = window.parent;')),
  );
  assert.equal(unsafeReport.hardValid, false);
  assert.ok(unsafeReport.diagnostics.some((item) => item.code === 'component.script.parent_access'));
});

test('explicit text and image intent outrank incidental interactive language', () => {
  assert.equal(inferPreferredKind('Write text explaining interactive maps.'), 'text');
  assert.equal(inferPreferredKind('Draw an image of an interactive atlas.'), 'image');
  assert.equal(inferPreferredKind('Build an interactive bioregion map.'), 'component');
});

test('rejects a blank canvas with generic zoom controls', () => {
  const report = inspectComponentArtifact(
    componentArtifact(`
<template><main><button @click="zoomIn">Zoom In</button><button @click="zoomOut">Zoom Out</button><canvas ref="map"></canvas></main></template>
<script>
const { reactive, ref } = Vue;
export default { setup() {
  const fallbackInputs = reactive({ climate: 'mild' });
  const dot = globalThis.Dot ?? { inputs: fallbackInputs, emit: () => {} };
  const dotInputs = dot.inputs;
  const emitDot = dot.emit.bind(dot);
  const zoom = ref(1);
  const zoomIn = () => { zoom.value += 1; emitDot('forestState', { zoom: zoom.value }); };
  const zoomOut = () => { zoom.value -= 1; };
  return { zoomIn, zoomOut, dotInputs };
} };
</script>
<style>main { width: 720px; height: 640px; overflow: auto; background: #111; }</style>`),
  );
  assert.equal(report.hardValid, false);
  assert.ok(report.diagnostics.some((item) => item.code === 'component.canvas.empty_risk'));
  assert.ok(report.diagnostics.some((item) => item.code === 'component.map.sparse_first_frame'));
});

test('rejects malformed scripts and unused declared ports', () => {
  const report = inspectComponentArtifact(
    componentArtifact(
      `<template><button @click="missing">broken</button></template><script>const x = ; export default {}</script>`,
    ),
  );
  assert.equal(report.hardValid, false);
  assert.ok(report.diagnostics.some((item) => item.code === 'component.script.compile'));
  assert.ok(report.diagnostics.some((item) => item.code === 'component.ports.input_unused'));
});

test('rejects SFC shapes that the browser sandbox cannot execute', () => {
  const report = inspectComponentArtifact(
    componentArtifact(`
<template><button @click="grow">grow</button></template>
<script type="module">
export const helper = 1;
export default { methods: { grow() {} } };
</script>
<style scoped>button { min-height: 40px; }</style>`),
  );

  assert.equal(report.hardValid, false);
  assert.ok(report.diagnostics.some((item) => item.code === 'component.script.attributes'));
  assert.ok(report.diagnostics.some((item) => item.code === 'component.style.attributes'));
  assert.ok(report.diagnostics.some((item) => item.code === 'component.script.named_export'));
});

test('strips one outer vue fence and enforces requested component kind', () => {
  assert.equal(sanitizeVueSource(`\`\`\`vue\n${validComponent}\n\`\`\``), validComponent.trim());
  const report = inspectGeneratedArtifacts([], { preferredKind: 'component' });
  assert.equal(report.passed, false);
  assert.ok(report.diagnostics.some((item) => item.code === 'response.component.missing'));
});

test('uses the original request when enforcing rich domain first-frame rules', () => {
  const genericMetadata = componentArtifact(
    `<template><main><button @click="act">act</button><button @click="undo">undo</button></main></template>
<script>
const { onMounted, reactive, ref } = Vue;
export default { setup() {
  const fallbackInputs = reactive({ climate: 'mild' });
  const dot = globalThis.Dot ?? { inputs: fallbackInputs, emit: () => {} };
  const dotInputs = dot.inputs;
  const emitDot = dot.emit.bind(dot);
  const value = ref(0);
  const act = () => { value.value += 1; emitDot('forestState', value.value); };
  const undo = () => { value.value -= 1; };
  onMounted(act);
  return { act, dotInputs, undo, value };
} };
</script>
<style>main { width: 100%; height: 100dvh; overflow: hidden; display: grid; } button { min-height: 40px; } button:focus-visible { outline: 2px solid white; } @media (prefers-reduced-motion: reduce) { * { transition: none; } }</style>`,
    {
      title: 'Interactive experience',
      purpose: 'Explore the system.',
      summary: 'A responsive instrument.',
    },
  );
  const report = inspectComponentArtifact(genericMetadata, {
    requestPrompt: 'Build an interactive bioregion map.',
  });

  assert.equal(report.hardValid, false);
  assert.ok(report.diagnostics.some((item) => item.code === 'component.map.sparse_first_frame'));
});

test('repairs the failing component in place without dropping valid siblings', () => {
  const firstComponent = { kind: 'component', title: 'working', children: [] };
  const failingComponent = {
    kind: 'component',
    title: 'failing',
    children: [{ kind: 'text', title: 'keep nested context', children: [] }],
  };
  const initial = [
    { kind: 'text', title: 'keep this', children: [] },
    firstComponent,
    { kind: 'object', title: 'keep this tree', children: [failingComponent] },
  ];
  const report = {
    componentReports: [{ passed: true }, { passed: false }],
  };
  const repairedComponent = { kind: 'component', title: 'repaired', children: [] };

  const target = findComponentRepairTarget(initial, report);
  const merged = mergeComponentRepairArtifacts(initial, [repairedComponent], target.index);

  assert.equal(target.artifact, failingComponent);
  assert.equal(merged.replaced, true);
  assert.equal(merged.artifacts[0].title, 'keep this');
  assert.equal(merged.artifacts[1].title, 'working');
  assert.equal(merged.artifacts[2].title, 'keep this tree');
  assert.equal(merged.artifacts[2].children[0].title, 'repaired');
  assert.equal(merged.artifacts[2].children[0].children[0].title, 'keep nested context');
});

test('preserves the initial constellation when targeted repair omits a component', () => {
  const initial = [
    { kind: 'text', title: 'keep this', children: [] },
    { kind: 'component', title: 'failing', children: [] },
  ];
  const repaired = [{ kind: 'text', title: 'prose-only repair', children: [] }];

  const merged = mergeComponentRepairArtifacts(initial, repaired, 0);

  assert.equal(merged.replaced, false);
  assert.equal(merged.targetMissing, true);
  assert.equal(merged.artifacts, initial);
});
