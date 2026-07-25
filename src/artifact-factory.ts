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

  if (/\b(html|javascript|js|interactive|component|button|form|screen|page|ui|widget|vue|react|counter|calculator|simulate|simulation|simulator)\b/.test(text)) return 'component';
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

function isFarmEcosystemSimulatorPrompt(value: string) {
  const text = value.toLowerCase();
  const hasLivingFarmDomain = /\b(farm|farming|ranch|livestock|pasture|agriculture|animal|ecosystem|habitat)\b/.test(text);
  const hasSimulationIntent = /\b(simulat(?:e|or|ion)|ecosystem|balance|season|weather|population|interactive world)\b/.test(text);
  return hasLivingFarmDomain && hasSimulationIntent;
}

function createFarmEcosystemArtifactContent(value: string): ArtifactContent {
  const title = makeArtifactTitle(value);
  const encodedTitle = JSON.stringify(title).replace(/</g, '\\u003c');
  const vue = `<template>
  <main class="farm-instrument" :class="['season-' + season.id, 'weather-' + weather]">
    <header class="world-header">
      <div>
        <span class="eyebrow">living farm</span>
        <h3>{{ title }}</h3>
      </div>
      <div class="balance-seal" :style="{ '--balance': balance + '%' }">
        <strong>{{ balance }}</strong><small>balance</small>
      </div>
    </header>

    <section class="world" aria-label="Interactive farm ecosystem">
      <button
        class="sky-control"
        type="button"
        :aria-label="'Weather is ' + weather + '. Change weather'"
        @click="cycleWeather"
      >
        <span aria-hidden="true">{{ weatherGlyph }}</span>
        <small>{{ weather }}</small>
      </button>

      <div class="cloud cloud-one" aria-hidden="true"></div>
      <div class="cloud cloud-two" aria-hidden="true"></div>
      <div class="hills" aria-hidden="true"></div>
      <div class="barn" aria-hidden="true"><i></i><b></b></div>

      <div class="pastures" aria-label="Pastures">
        <button
          v-for="(plot, index) in plots"
          :key="plot.name"
          class="plot"
          type="button"
          :aria-label="plot.growth >= 8 ? 'Harvest ' + plot.name + ' pasture' : 'Tend ' + plot.name + ' pasture'"
          @click="tendPlot(index)"
        >
          <span class="crop-row" aria-hidden="true">
            <i v-for="crop in plot.growth" :key="crop" :style="{ '--crop': crop }"></i>
          </span>
          <small>{{ plot.growth >= 8 ? 'harvest' : plot.name }}</small>
        </button>
      </div>

      <div class="animal-rail" aria-label="Welcome animals">
        <button
          v-for="animal in animals"
          :key="animal.id"
          class="animal"
          type="button"
          :aria-label="'Welcome a ' + animal.name + '. ' + animal.count + ' here'"
          @click="welcomeAnimal(animal)"
        >
          <span aria-hidden="true">{{ animal.glyph }}</span>
          <b>{{ animal.count }}</b>
        </button>
      </div>
    </section>

    <footer class="world-controls">
      <div class="season-cycle" role="group" aria-label="Season">
        <button
          v-for="(item, index) in seasons"
          :key="item.id"
          type="button"
          :class="{ active: index === seasonIndex }"
          :aria-pressed="index === seasonIndex"
          :aria-label="'Move farm into ' + item.name"
          @click="chooseSeason(index)"
        ><span aria-hidden="true">{{ item.glyph }}</span><small>{{ item.name }}</small></button>
      </div>
      <div class="balance-bed" :aria-label="'Ecosystem balance ' + balance + ' percent'">
        <i :style="{ width: balance + '%' }"></i>
        <small>{{ balanceHint }}</small>
      </div>
    </footer>
  </main>
</template>

<script>
const { computed, onMounted, reactive, ref, watch } = Vue;

const fallbackInputs = reactive({ climate: '' });
const dot = globalThis.Dot ?? { inputs: fallbackInputs, emit: () => {} };
const dotInputs = dot.inputs ?? fallbackInputs;
const emitDot = typeof dot.emit === 'function' ? dot.emit.bind(dot) : () => {};

export default {
  setup() {
    const title = ${encodedTitle};
    const seasons = [
      { id: 'spring', name: 'spring', glyph: '✿' },
      { id: 'summer', name: 'summer', glyph: '☀' },
      { id: 'autumn', name: 'autumn', glyph: '◇' },
      { id: 'winter', name: 'winter', glyph: '✦' },
    ];
    const seasonIndex = ref(0);
    const weather = ref('sun');
    const weatherCycle = ['sun', 'rain', 'wind'];
    const plots = reactive([
      { name: 'clover', growth: 4 },
      { name: 'grain', growth: 6 },
      { name: 'orchard', growth: 3 },
    ]);
    const animals = reactive([
      { id: 'cows', name: 'cow', glyph: '🐄', count: 2 },
      { id: 'sheep', name: 'sheep', glyph: '🐑', count: 3 },
      { id: 'hens', name: 'hen', glyph: '🐓', count: 4 },
    ]);

    const climate = computed(() => String(dotInputs.climate ?? '').trim().toLowerCase());
    const season = computed(() => seasons[seasonIndex.value]);
    const weatherGlyph = computed(() => ({ sun: '☀', rain: '☂', wind: '≋' }[weather.value]));
    const totalGrowth = computed(() => plots.reduce((sum, plot) => sum + plot.growth, 0));
    const totalAnimals = computed(() => animals.reduce((sum, animal) => sum + animal.count, 0));
    const balance = computed(() => {
      const carryingFit = 100 - Math.abs(totalGrowth.value - totalAnimals.value * 1.7) * 4;
      const climateFit = weather.value === 'rain' && season.value.id === 'winter' ? -10 : 4;
      return Math.max(18, Math.min(100, Math.round(carryingFit + climateFit)));
    });
    const balanceHint = computed(() => {
      if (balance.value > 82) return 'thriving together';
      if (balance.value > 58) return 'finding balance';
      return totalAnimals.value * 1.7 > totalGrowth.value ? 'grow more pasture' : 'welcome more life';
    });
    const farmState = computed(() => ({
      season: season.value.id,
      weather: weather.value,
      balance: balance.value,
      animals: Object.fromEntries(animals.map((animal) => [animal.id, animal.count])),
      pastures: Object.fromEntries(plots.map((plot) => [plot.name, plot.growth])),
    }));

    watch(climate, (next) => {
      if (/rain|wet|storm/.test(next)) weather.value = 'rain';
      else if (/wind|dry|breeze/.test(next)) weather.value = 'wind';
      else if (/sun|warm|clear|hot/.test(next)) weather.value = 'sun';
    }, { immediate: true });

    watch(farmState, (next) => emitDot('farmState', next), { deep: true });

    function cycleWeather() {
      weather.value = weatherCycle[(weatherCycle.indexOf(weather.value) + 1) % weatherCycle.length];
    }

    function chooseSeason(index) {
      seasonIndex.value = index;
      if (seasons[index].id === 'spring' || seasons[index].id === 'summer') {
        plots.forEach((plot) => { plot.growth = Math.min(8, plot.growth + 1); });
      }
      if (seasons[index].id === 'winter') {
        plots.forEach((plot) => { plot.growth = Math.max(2, plot.growth - 1); });
      }
    }

    function tendPlot(index) {
      const plot = plots[index];
      if (plot.growth >= 8) {
        emitDot('harvest', { pasture: plot.name, yield: plot.growth * 3, season: season.value.id });
        plot.growth = 2;
      } else {
        plot.growth += weather.value === 'rain' ? 2 : 1;
        plot.growth = Math.min(8, plot.growth);
      }
    }

    function welcomeAnimal(animal) {
      animal.count = Math.min(12, animal.count + 1);
    }

    onMounted(() => emitDot('farmState', farmState.value));

    return {
      animals,
      balance,
      balanceHint,
      chooseSeason,
      cycleWeather,
      farmState,
      plots,
      season,
      seasonIndex,
      seasons,
      tendPlot,
      title,
      weather,
      weatherGlyph,
      welcomeAnimal,
    };
  },
};
</script>

<style>
.farm-instrument {
  --cream: #fff8dc;
  --leaf: #75d078;
  --sunlight: #ffd27a;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: clamp(7px, 2vh, 13px);
  width: 100%;
  height: 100vh;
  min-height: 260px;
  padding: clamp(12px, 3.6vw, 22px);
  overflow: hidden;
  color: var(--cream);
  background: #10170f;
  font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
}
.world-header { z-index: 3; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.eyebrow { color: rgba(255,248,220,.55); font-size: 9px; font-weight: 850; letter-spacing: .16em; text-transform: uppercase; }
h3 { max-width: 28ch; margin: 2px 0 0; overflow: hidden; font-size: clamp(15px, 4.8vw, 25px); line-height: 1.05; letter-spacing: -.035em; text-overflow: ellipsis; white-space: nowrap; }
.balance-seal { display: grid; width: 46px; aspect-ratio: 1; flex: 0 0 auto; place-content: center; border: 1px solid rgba(255,255,255,.16); border-radius: 50%; background: conic-gradient(var(--leaf) var(--balance), rgba(255,255,255,.08) 0); text-align: center; box-shadow: inset 0 0 0 5px #172016; }
.balance-seal strong { font-size: 13px; line-height: 1; }
.balance-seal small { margin-top: 2px; color: rgba(255,248,220,.58); font-size: 6px; letter-spacing: .08em; text-transform: uppercase; }
.world { position: relative; min-height: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: clamp(20px, 7vw, 38px); isolation: isolate; background: linear-gradient(#8ed0c1 0 48%, #70a960 49% 100%); box-shadow: inset 0 -50px 80px rgba(24,53,24,.3); transition: background .7s ease; }
.season-summer .world { background: linear-gradient(#76c9cc 0 46%, #80ad53 47% 100%); }
.season-autumn .world { background: linear-gradient(#9eb6b1 0 46%, #a77841 47% 100%); }
.season-winter .world { background: linear-gradient(#b8c9cf 0 46%, #a8b3a8 47% 100%); }
.weather-rain .world { filter: saturate(.72) brightness(.86); }
.weather-wind .world { filter: saturate(.86); }
.hills { position: absolute; right: -5%; bottom: 30%; left: -5%; height: 45%; border-radius: 50% 58% 0 0; background: linear-gradient(140deg, #4d8b56, #315e3d); }
.sky-control { position: absolute; z-index: 5; top: 9px; right: 10px; display: grid; width: clamp(46px, 13vw, 61px); aspect-ratio: 1; min-height: 0; padding: 2px; place-content: center; border: 1px solid rgba(255,255,255,.35); border-radius: 50%; color: #463714; background: radial-gradient(circle at 35% 30%, #fff5bd, var(--sunlight)); box-shadow: 0 0 28px rgba(255,214,121,.4); cursor: pointer; }
.sky-control span { font-size: clamp(19px, 6vw, 29px); line-height: .8; }
.sky-control small { font-size: 6px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.weather-rain .sky-control { color: #e8f4f4; background: #456a73; box-shadow: 0 0 28px rgba(90,141,158,.45); }
.weather-wind .sky-control { color: #244a46; background: #c8e1d1; }
.cloud { position: absolute; z-index: 1; width: 42px; height: 12px; border-radius: 99px; background: rgba(255,255,255,.52); filter: blur(.2px); animation: drift 11s linear infinite alternate; }
.cloud::before, .cloud::after { position: absolute; bottom: 2px; width: 16px; aspect-ratio: 1; border-radius: 50%; background: inherit; content: ""; }
.cloud::before { left: 7px; } .cloud::after { right: 5px; width: 21px; }
.cloud-one { top: 18%; left: 12%; }.cloud-two { top: 31%; left: 47%; scale: .7; animation-delay: -5s; }
.pastures { position: absolute; z-index: 3; right: 65px; bottom: 6%; left: 5%; display: grid; height: 42%; grid-template-columns: repeat(3, 1fr); gap: clamp(4px, 1.7vw, 9px); }
.plot { position: relative; display: grid; min-width: 0; min-height: 0; padding: 5px; overflow: hidden; place-content: end center; border: 1px solid rgba(255,248,220,.21); border-radius: 48% 52% 42% 58% / 45% 48% 52% 55%; color: rgba(255,248,220,.75); background: repeating-linear-gradient(100deg, #456d35 0 7px, #385e30 8px 14px); cursor: pointer; transition: transform .25s ease, filter .25s ease; }
.plot:hover { z-index: 2; filter: brightness(1.14); transform: scale(1.04); }
.plot:active { transform: scale(.96); }
.plot small { z-index: 2; overflow: hidden; font-size: 7px; font-weight: 850; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.crop-row { position: absolute; right: 4px; bottom: 12px; left: 4px; display: flex; height: 70%; align-items: end; justify-content: space-evenly; }
.crop-row i { width: clamp(2px, .9vw, 4px); height: calc(18% + var(--crop) * 7%); max-height: 95%; border-radius: 99px 99px 0 0; background: #b9dd6c; box-shadow: 0 0 7px rgba(185,221,108,.2); transform: rotate(calc((var(--crop) - 4) * 1deg)); transform-origin: bottom; }
.barn { position: absolute; z-index: 2; right: 14%; bottom: 28%; width: clamp(37px, 12vw, 58px); height: clamp(29px, 9vw, 44px); background: #a54e3f; box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
.barn::before { position: absolute; top: -45%; left: -10%; width: 120%; height: 55%; background: #5d382b; clip-path: polygon(50% 0,100% 100%,0 100%); content: ""; }
.barn i { position: absolute; bottom: 0; left: 38%; width: 26%; height: 60%; background: #462f27; }.barn b { position: absolute; top: 18%; left: 13%; width: 13%; aspect-ratio: 1; background: #ffd888; }
.animal-rail { position: absolute; z-index: 6; right: 7px; bottom: 7px; display: grid; gap: 5px; }
.animal { position: relative; display: grid; width: clamp(38px, 11vw, 48px); aspect-ratio: 1; min-height: 0; padding: 0; place-content: center; border: 1px solid rgba(255,255,255,.28); border-radius: 50%; background: rgba(21,33,19,.72); box-shadow: 0 5px 18px rgba(0,0,0,.2); cursor: pointer; backdrop-filter: blur(8px); transition: transform .22s ease; }
.animal:hover { transform: translateX(-3px) scale(1.05); }
.animal span { font-size: clamp(17px, 5.5vw, 25px); line-height: 1; }
.animal b { position: absolute; right: -2px; bottom: -1px; display: grid; width: 16px; aspect-ratio: 1; place-content: center; border-radius: 50%; color: #18301a; background: var(--leaf); font-size: 8px; }
.world-controls { display: grid; grid-template-columns: minmax(150px, 1fr) minmax(105px, .7fr); gap: 10px; align-items: center; }
.season-cycle { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.season-cycle button { display: grid; min-width: 0; min-height: 32px; padding: 3px; place-items: center; border: 1px solid transparent; border-radius: 12px; color: rgba(255,248,220,.52); background: rgba(255,255,255,.045); cursor: pointer; }
.season-cycle button.active { border-color: rgba(255,248,220,.22); color: var(--cream); background: rgba(117,208,120,.14); }
.season-cycle span { font-size: 13px; line-height: 1; }.season-cycle small { overflow: hidden; max-width: 100%; font-size: 6px; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; }
.balance-bed { position: relative; height: 7px; border-radius: 99px; background: rgba(255,255,255,.08); }
.balance-bed i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #d9aa5e, var(--leaf)); box-shadow: 0 0 14px rgba(117,208,120,.24); transition: width .45s ease; }
.balance-bed small { position: absolute; top: 10px; right: 0; color: rgba(255,248,220,.52); font-size: 7px; letter-spacing: .06em; white-space: nowrap; }
@keyframes drift { to { transform: translateX(22px); } }
@media (max-height: 340px) {
  .farm-instrument { grid-template-columns: minmax(110px, .55fr) 1.45fr; grid-template-rows: 1fr auto; }
  .world-header { display: grid; align-content: start; }
  .world { grid-column: 2; grid-row: 1 / 3; }
  .world-controls { display: block; }
  .balance-bed { margin-top: 13px; }
  .balance-seal { width: 38px; }
}
@media (max-width: 380px) {
  .world-controls { grid-template-columns: 1fr; }
  .balance-bed { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
}
</style>`;

  return {
    raw: vue,
    description: value,
    vue,
    tags: ['component', 'vue', 'farm', 'ecosystem', 'simulation'],
    connections: ['climate', 'farm state', 'harvest', 'ecosystem balance'],
    capabilities: ['simulate', 'tend', 'connect'],
    summary: 'Direct-manipulation farm world with living weather, seasons, pastures, animals, and ecosystem balance.',
    ports: {
      inputs: [{ id: 'climate', label: 'climate', type: 'text', mode: 'state', purpose: 'Changes the farm weather when connected climate text mentions sun, rain, wind, heat, or storms.' }],
      outputs: [
        { id: 'farmState', label: 'farm state', type: 'data', mode: 'state', purpose: 'Emits the current season, weather, ecosystem balance, animal populations, and pasture growth.' },
        { id: 'harvest', label: 'harvest', type: 'event', mode: 'event', purpose: 'Emits a harvest event when a mature pasture is touched.' },
      ],
    },
  };
}

function createComponentArtifactContent(value: string): ArtifactContent {
  if (isFarmEcosystemSimulatorPrompt(value)) return createFarmEcosystemArtifactContent(value);

  const title = makeArtifactTitle(value);
  const encodedTitle = JSON.stringify(title).replace(/</g, '\\u003c');
  const vue = `<template>
  <main class="growth-instrument">
    <header>
      <span class="eyebrow">living instrument</span>
      <h3>{{ title }}</h3>
    </header>

    <section class="habitat" :class="{ awake: count > seed }">
      <div class="orbit" aria-hidden="true">
        <i
          v-for="sprout in sprouts"
          :key="sprout"
          :style="{ '--i': sprout, '--total': sprouts.length }"
        ><b></b></i>
      </div>

      <button
        class="organism"
        type="button"
        :aria-label="'Grow to ' + (count + 1)"
        @click="increment"
      >
        <span class="rings" aria-hidden="true"></span>
        <strong>{{ count }}</strong>
        <small>touch to grow</small>
      </button>
    </section>

    <footer>
      <span>seed {{ seed }}</span>
      <span class="pulse"><i></i>{{ count === seed ? 'resting' : 'growing' }}</span>
      <button v-if="count !== seed" class="reset" type="button" @click="reset">return to seed</button>
    </footer>
  </main>
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
    const sprouts = computed(() => Array.from(
      { length: Math.max(4, Math.min(14, count.value + 4)) },
      (_, index) => index,
    ));

    watch(seed, (next) => {
      count.value = next;
      emitDot('count', count.value);
    });

    function increment() {
      count.value += 1;
      emitDot('count', count.value);
    }

    function reset() {
      count.value = seed.value;
      emitDot('count', count.value);
    }

    onMounted(() => emitDot('count', count.value));

    return { count, increment, reset, seed, sprouts, title };
  },
};
</script>

<style>
.growth-instrument {
  --cream: #fff8df;
  --moss: #9fea83;
  --sun: #ffc772;
  display: grid;
  grid-template-rows: auto minmax(180px, 1fr) auto;
  gap: clamp(10px, 3vw, 20px);
  min-height: 100vh;
  padding: clamp(16px, 5vw, 28px);
  overflow: hidden;
  color: var(--cream);
  background:
    radial-gradient(circle at 28% 8%, rgba(255, 199, 114, .2), transparent 29%),
    radial-gradient(circle at 72% 78%, rgba(117, 229, 112, .18), transparent 36%),
    #11170f;
  font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
}
header { position: relative; z-index: 2; }
h3 { max-width: 28ch; margin: 3px 0 0; font-size: clamp(17px, 5vw, 26px); line-height: 1.05; letter-spacing: -.03em; }
.eyebrow, footer { color: rgba(255, 248, 223, .56); font-size: 10px; font-weight: 760; letter-spacing: .14em; text-transform: uppercase; }
.habitat { position: relative; display: grid; min-height: 180px; place-items: center; isolation: isolate; }
.habitat::before {
  position: absolute;
  width: min(80vw, 270px);
  aspect-ratio: 1;
  border: 1px solid rgba(159, 234, 131, .16);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(159, 234, 131, .08), transparent 64%);
  content: "";
}
.orbit { position: absolute; width: min(57vw, 190px); aspect-ratio: 1; }
.orbit i {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: rotate(calc((360deg / var(--total)) * var(--i))) translateY(clamp(-86px, -25vw, -58px));
  transform-origin: 0 0;
}
.orbit b {
  display: block;
  width: clamp(5px, 2.3vw, 9px);
  aspect-ratio: 1;
  border-radius: 70% 20% 70% 20%;
  background: var(--moss);
  box-shadow: 0 0 16px rgba(159, 234, 131, .55);
  transform: rotate(calc((-360deg / var(--total)) * var(--i)));
  animation: breathe 3.6s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * -130ms);
}
.organism {
  position: relative;
  z-index: 2;
  display: grid;
  width: clamp(92px, 31vw, 132px);
  aspect-ratio: 1;
  place-content: center;
  border: 1px solid rgba(255, 248, 223, .28);
  border-radius: 46% 54% 57% 43% / 52% 42% 58% 48%;
  color: #11170f;
  background: radial-gradient(circle at 38% 30%, #fff3ba, var(--sun) 42%, #8dcf68);
  box-shadow: 0 16px 48px rgba(0, 0, 0, .32), 0 0 50px rgba(159, 234, 131, .17);
  cursor: pointer;
  transition: transform .35s cubic-bezier(.2,.8,.2,1), border-radius .7s ease;
}
.organism:hover { transform: scale(1.045) rotate(-2deg); }
.organism:active { transform: scale(.95); }
.organism:focus-visible { outline: 3px solid var(--cream); outline-offset: 5px; }
.organism strong { position: relative; font-size: clamp(31px, 11vw, 50px); line-height: .9; }
.organism small { position: relative; margin-top: 8px; font-size: 9px; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }
.rings { position: absolute; inset: 9px; border: 1px solid rgba(17, 23, 15, .13); border-radius: inherit; }
.awake .organism { border-radius: 58% 42% 44% 56% / 41% 53% 47% 59%; }
footer { z-index: 2; display: flex; min-height: 24px; align-items: center; gap: 12px; }
.pulse { display: inline-flex; align-items: center; gap: 5px; }
.pulse i { width: 6px; aspect-ratio: 1; border-radius: 50%; background: var(--moss); box-shadow: 0 0 8px var(--moss); }
.reset { margin-left: auto; padding: 6px 10px; border: 1px solid rgba(255,255,255,.12); border-radius: 999px; color: inherit; background: rgba(255,255,255,.05); font-size: 10px; letter-spacing: .06em; cursor: pointer; }
@keyframes breathe { to { opacity: .45; transform: scale(.68) rotate(calc((-360deg / var(--total)) * var(--i))); } }
@media (max-height: 340px) {
  .growth-instrument { grid-template-columns: .8fr 1.2fr; grid-template-rows: 1fr auto; align-items: center; }
  .habitat { grid-row: 1 / 3; grid-column: 2; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
}
</style>`;

  return {
    raw: vue,
    description: value,
    vue,
    tags: ['component', 'vue'],
    connections: ['seed', 'count', 'growth'],
    capabilities: ['render', 'interact', 'connect'],
    summary: 'Graphical growth instrument with a live seed input and count output.',
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
