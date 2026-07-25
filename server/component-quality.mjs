import vm from 'node:vm';
import { compileScript, compileTemplate, parse as parseSfc } from '@vue/compiler-sfc';

const MAX_COMPONENT_SOURCE_LENGTH = 96_000;
const QUALITY_THRESHOLD = 60;

const RICH_DOMAIN_PATTERN =
  /\b(simulat(?:e|ion|or)|map|atlas|explorer|world|builder|planner|ecosystem|city|bioregion|watershed|timeline|editor)\b/i;
const MAP_DOMAIN_PATTERN = /\b(map|atlas|city|bioregion|watershed|region|forest)\b/i;
const NETWORK_PATTERN =
  /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|Worker|SharedWorker)\s*(?:\.|\()/;
const PARENT_ACCESS_PATTERN =
  /\b(?:window|globalThis|self)\s*\.\s*(?:parent|top|opener)\b/;
const EXTERNAL_RESOURCE_PATTERN =
  /<(?:script|link|iframe|object|embed)\b[^>]*(?:src|href)\s*=|@import\b|url\(\s*['"]?https?:/i;
const INTERACTION_PATTERN =
  /@(?:click|dblclick|pointerdown|pointermove|pointerup|mousedown|mousemove|mouseup|touchstart|dragstart|dragover|drop|wheel|input|change|keydown|keyup)\b|v-model(?:\.[\w-]+)*/gi;
const DIRECT_INTERACTION_PATTERN =
  /<(?!button\b|input\b|select\b|textarea\b)[a-z][\w:-]*\b[^>]*@(?:click|dblclick|pointerdown|pointermove|pointerup|dragstart|drop|wheel|keydown)\b/gi;
const DYNAMIC_VISUAL_PATTERN = /\{\{[\s\S]*?\}\}|:(?:class|style)\s*=|v-(?:if|else|show|for)\b/gi;
const DRAW_OPERATION_PATTERN =
  /\.(?:fillRect|strokeRect|clearRect|arc|ellipse|lineTo|bezierCurveTo|quadraticCurveTo|drawImage|fillText|strokeText|fill|stroke)\s*\(/g;
const SVG_SHAPE_PATTERN = /<(?:path|circle|ellipse|rect|line|polyline|polygon|use)\b/gi;
const STATE_PATTERN = /\b(?:ref|reactive)\s*\(/g;
const DERIVED_STATE_PATTERN = /\bcomputed\s*\(/g;
const RESPONSIVE_PATTERN = /(?:clamp|minmax|min|max)\s*\(|@media\b|\b(?:d?v[wh]|sv[wh]|lv[wh])\b|(?:width|height)\s*:\s*100%/i;
const LARGE_FIXED_SURFACE_PATTERN = /(?:width|height|min-height)\s*:\s*(?:[5-9]\d{2}|\d{4,})px/i;
const NORMAL_SCROLL_PATTERN = /overflow(?:-[xy])?\s*:\s*(?:auto|scroll)/i;

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function diagnostic(code, message, severity = 'warning', penalty = 8) {
  return { code, message, severity, penalty };
}

function errorMessage(error) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return String(error);
}

function blockAttributeNames(block) {
  return block?.attrs && typeof block.attrs === 'object' ? Object.keys(block.attrs) : [];
}

function maskJavascriptCommentsAndStrings(source) {
  let result = '';
  let state = 'code';

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    const preserveLineBreak = character === '\n' || character === '\r';

    if (state === 'code') {
      if (character === '/' && next === '/') {
        result += '  ';
        state = 'line-comment';
        index += 1;
      } else if (character === '/' && next === '*') {
        result += '  ';
        state = 'block-comment';
        index += 1;
      } else if (character === "'") {
        result += ' ';
        state = 'single';
      } else if (character === '"') {
        result += ' ';
        state = 'double';
      } else if (character === '`') {
        result += ' ';
        state = 'template';
      } else {
        result += character;
      }
      continue;
    }

    if (preserveLineBreak) {
      result += character;
      if (state === 'line-comment') state = 'code';
      continue;
    }

    result += ' ';
    if (character === '\\' && ['single', 'double', 'template'].includes(state)) {
      if (index + 1 < source.length) {
        result += source[index + 1] === '\n' || source[index + 1] === '\r' ? source[index + 1] : ' ';
        index += 1;
      }
    } else if (
      (state === 'single' && character === "'") ||
      (state === 'double' && character === '"') ||
      (state === 'template' && character === '`')
    ) {
      state = 'code';
    } else if (state === 'block-comment' && character === '*' && next === '/') {
      result += ' ';
      state = 'code';
      index += 1;
    }
  }

  return result;
}

function artifactDescriptor(artifact, requestPrompt = '') {
  return [requestPrompt, artifact?.title, artifact?.purpose, artifact?.summary, artifact?.content?.description]
    .filter((value) => typeof value === 'string')
    .join(' ');
}

function runtimePortIds(source, direction) {
  const ids = [];
  const patterns =
    direction === 'input'
      ? [
          /\b(?:dotInputs|Dot\.inputs|dot\.inputs)\s*(?:\?\.|\.)\s*([a-zA-Z][a-zA-Z0-9_-]*)/g,
          /\b(?:dotInputs|Dot\.inputs|dot\.inputs)\s*(?:\?\.)?\[\s*['"]([a-zA-Z][a-zA-Z0-9_-]*)['"]\s*\]/g,
        ]
      : [/\b(?:emitDot|Dot\.emit|dot\.emit)\s*(?:\?\.)?\(\s*['"]([a-zA-Z][a-zA-Z0-9_-]*)['"]/g];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) ids.push(match[1]);
  }
  return [...new Set(ids)];
}

function hasFiveVisibleDomainItems(template, script) {
  const svgShapes = countMatches(template, SVG_SHAPE_PATTERN);
  const namedSvgItems = countMatches(template, /<(?:text|title)\b/gi);
  const interactiveSvgShapes = countMatches(
    template,
    /<(?:path|circle|ellipse|rect|line|polyline|polygon|use)\b[^>]*(?:@click|@pointerdown|role\s*=\s*["']button["']|aria-label\s*=)/gi,
  );
  if (svgShapes >= 5 && (namedSvgItems >= 5 || interactiveSvgShapes >= 5)) return true;

  const objectLiterals = countMatches(script, /\{[^{}]{0,700}\}/g);
  const hasDomainCollection =
    /\b(?:landmarks?|regions?|nodes?|places?|locations?|districts?|habitats?|routes?|stations?|stops?)\b/i.test(
      script,
    );
  if (objectLiterals >= 5 && /v-for\b/.test(template) && hasDomainCollection) return true;
  if (/Array\.from\(\s*\{\s*length\s*:\s*(?:[5-9]|\d{2,})\b/.test(script) && hasDomainCollection) {
    return true;
  }
  if (/(?:for|while)\s*\([^)]*\)/.test(script) && hasDomainCollection) return true;
  return false;
}

export function sanitizeVueSource(value) {
  const source = typeof value === 'string' ? value.trim() : '';
  const fenced = source.match(/^```(?:vue|html)?\s*([\s\S]*?)\s*```$/i);
  return (fenced?.[1] ?? source).trim();
}

export function inspectComponentArtifact(artifact, { requestPrompt = '' } = {}) {
  const diagnostics = [];
  const source = sanitizeVueSource(artifact?.content?.vue);
  const descriptorText = artifactDescriptor(artifact, requestPrompt);

  if (!source) {
    diagnostics.push(diagnostic('component.vue.empty', 'content.vue is empty.', 'error', 100));
    return {
      component: true,
      hardValid: false,
      passed: false,
      score: 0,
      diagnostics,
    };
  }

  if (source.length > MAX_COMPONENT_SOURCE_LENGTH) {
    diagnostics.push(
      diagnostic(
        'component.vue.too_large',
        `content.vue exceeds ${MAX_COMPONENT_SOURCE_LENGTH} characters.`,
        'error',
        100,
      ),
    );
  }

  const parsed = parseSfc(source, { filename: 'GeneratedDotComponent.vue' });
  for (const parseError of parsed.errors) {
    diagnostics.push(
      diagnostic('component.sfc.parse', `SFC parse error: ${errorMessage(parseError)}`, 'error', 35),
    );
  }

  const { descriptor } = parsed;
  const template = descriptor.template?.content?.trim() ?? '';
  const script = descriptor.script?.content?.trim() ?? '';
  const scriptCode = maskJavascriptCommentsAndStrings(script);
  const style = descriptor.styles[0]?.content?.trim() ?? '';

  if (!descriptor.template || !template) {
    diagnostics.push(diagnostic('component.template.missing', 'A non-empty <template> is required.', 'error', 40));
  }
  if (!descriptor.script || !script) {
    diagnostics.push(diagnostic('component.script.missing', 'A non-empty normal <script> is required.', 'error', 40));
  }
  if (descriptor.scriptSetup) {
    diagnostics.push(diagnostic('component.script.setup', '<script setup> is unsupported.', 'error', 40));
  }
  if (blockAttributeNames(descriptor.template).length) {
    diagnostics.push(
      diagnostic(
        'component.template.attributes',
        'Use one plain <template> block without attributes.',
        'error',
        30,
      ),
    );
  }
  if (blockAttributeNames(descriptor.script).length) {
    diagnostics.push(
      diagnostic(
        'component.script.attributes',
        'Use one plain <script> block without setup, src, lang, type, or other attributes.',
        'error',
        35,
      ),
    );
  }
  if (descriptor.styles.some((block) => blockAttributeNames(block).length)) {
    diagnostics.push(
      diagnostic(
        'component.style.attributes',
        'Use one optional plain <style> block without scoped, module, src, lang, or other attributes.',
        'error',
        30,
      ),
    );
  }
  if (descriptor.script?.src || descriptor.template?.src || descriptor.styles.some((block) => block.src)) {
    diagnostics.push(diagnostic('component.sfc.external_block', 'SFC src blocks are unsupported.', 'error', 35));
  }
  if (descriptor.script?.lang && descriptor.script.lang !== 'js') {
    diagnostics.push(diagnostic('component.script.language', 'Use plain JavaScript, not TypeScript or JSX.', 'error', 35));
  }
  if (descriptor.template?.lang) {
    diagnostics.push(diagnostic('component.template.language', 'Template preprocessors are unsupported.', 'error', 35));
  }
  if (descriptor.styles.length > 1 || descriptor.styles.some((block) => block.lang)) {
    diagnostics.push(diagnostic('component.style.shape', 'Use at most one plain CSS <style> block.', 'error', 25));
  }
  if (descriptor.customBlocks.length) {
    diagnostics.push(diagnostic('component.sfc.custom_block', 'Custom SFC blocks are unsupported.', 'error', 25));
  }

  if (/\bimport\s*(?:\(|[\s{*])/.test(scriptCode) || /\brequire\s*\(/.test(scriptCode)) {
    diagnostics.push(diagnostic('component.script.import', 'Imports and require() are unsupported.', 'error', 35));
  }
  if (NETWORK_PATTERN.test(scriptCode)) {
    diagnostics.push(diagnostic('component.script.network', 'Network APIs are unavailable in the sandbox.', 'error', 35));
  }
  if (PARENT_ACCESS_PATTERN.test(scriptCode)) {
    diagnostics.push(diagnostic('component.script.parent_access', 'Parent-window access is forbidden.', 'error', 35));
  }
  if (EXTERNAL_RESOURCE_PATTERN.test(source)) {
    diagnostics.push(diagnostic('component.external_resource', 'External resources are unavailable.', 'error', 35));
  }

  const exportMatches = scriptCode.match(/\bexport\s+default\b/g)?.length ?? 0;
  if (exportMatches !== 1) {
    diagnostics.push(
      diagnostic(
        'component.script.default_export',
        'The script must contain exactly one export default component.',
        'error',
        40,
      ),
    );
  }
  if ((scriptCode.match(/\bexport\b/g)?.length ?? 0) !== 1) {
    diagnostics.push(
      diagnostic(
        'component.script.named_export',
        'Only one export default is supported; remove named or additional exports.',
        'error',
        35,
      ),
    );
  }

  if (descriptor.script && !descriptor.scriptSetup) {
    try {
      compileScript(descriptor, { id: 'dot-generated-component' });
    } catch (error) {
      diagnostics.push(
        diagnostic('component.script.compile', `Script compile error: ${errorMessage(error)}`, 'error', 40),
      );
    }
  }

  if (script && exportMatches === 1) {
    try {
      const transformed = script.replace(/\bexport\s+default\b/, 'const __component__ =');
      new vm.Script(`(() => {\n${transformed}\nreturn __component__;\n})`, {
        filename: 'GeneratedDotComponent.js',
      });
    } catch (error) {
      diagnostics.push(
        diagnostic('component.script.syntax', `JavaScript syntax error: ${errorMessage(error)}`, 'error', 40),
      );
    }
  }

  if (template) {
    const templateErrors = [];
    const compiled = compileTemplate({
      source: template,
      filename: 'GeneratedDotComponent.vue',
      id: 'dot-generated-component',
      compilerOptions: {
        onError(error) {
          templateErrors.push(error);
        },
      },
    });
    for (const compileError of [...templateErrors, ...compiled.errors]) {
      diagnostics.push(
        diagnostic(
          'component.template.compile',
          `Template compile error: ${errorMessage(compileError)}`,
          'error',
          40,
        ),
      );
    }
  }

  const inputs = Array.isArray(artifact?.ports?.inputs) ? artifact.ports.inputs : [];
  const outputs = Array.isArray(artifact?.ports?.outputs) ? artifact.ports.outputs : [];
  if (!inputs.length) {
    diagnostics.push(diagnostic('component.ports.input_missing', 'Declare at least one useful input.', 'error', 25));
  }
  if (!outputs.length) {
    diagnostics.push(diagnostic('component.ports.output_missing', 'Declare at least one useful output.', 'error', 25));
  }

  const readInputIds = new Set(runtimePortIds(script, 'input'));
  const emittedOutputIds = new Set(runtimePortIds(script, 'output'));
  for (const port of inputs) {
    if (!readInputIds.has(port.id)) {
      diagnostics.push(
        diagnostic(
          'component.ports.input_unused',
          `Declared input "${port.id}" is never read through Dot.inputs.`,
          'error',
          20,
        ),
      );
    }
  }
  for (const port of outputs) {
    if (!emittedOutputIds.has(port.id)) {
      diagnostics.push(
        diagnostic(
          'component.ports.output_unused',
          `Declared output "${port.id}" is never emitted through Dot.emit.`,
          'error',
          20,
        ),
      );
    }
  }

  const interactions = countMatches(template, INTERACTION_PATTERN);
  const directInteractions = countMatches(template, DIRECT_INTERACTION_PATTERN);
  const dynamicVisuals = countMatches(template, DYNAMIC_VISUAL_PATTERN);
  const mutableState = countMatches(script, STATE_PATTERN);
  const derivedState = countMatches(script, DERIVED_STATE_PATTERN);
  const richDomain = RICH_DOMAIN_PATTERN.test(descriptorText);
  const mapDomain = MAP_DOMAIN_PATTERN.test(descriptorText);
  const usesCanvas = /<canvas\b/i.test(template);
  const usesSvg = /<svg\b/i.test(template);

  if (!interactions) {
    diagnostics.push(diagnostic('component.interaction.none', 'The component has no usable interaction.', 'error', 35));
  } else if (interactions < (richDomain ? 3 : 2)) {
    diagnostics.push(
      diagnostic(
        'component.interaction.too_shallow',
        richDomain
          ? 'Rich components need at least three distinct state-changing interactions.'
          : 'Provide at least two meaningful interaction paths.',
        'warning',
        16,
      ),
    );
  }
  if (!directInteractions) {
    diagnostics.push(
      diagnostic(
        'component.interaction.not_direct',
        'At least one primary interaction should manipulate the represented thing, not only a generic button.',
        'warning',
        12,
      ),
    );
  }
  if (mutableState < (richDomain ? 2 : 1)) {
    diagnostics.push(
      diagnostic(
        'component.state.too_shallow',
        richDomain ? 'Model at least two mutable domain variables.' : 'Add meaningful mutable state.',
        'warning',
        14,
      ),
    );
  }
  if (richDomain && !derivedState) {
    diagnostics.push(
      diagnostic('component.state.no_consequence', 'Rich components need derived state or a visible consequence.', 'warning', 12),
    );
  }
  if (dynamicVisuals < 2) {
    diagnostics.push(
      diagnostic('component.visual.static', 'State must visibly change the scene in multiple ways.', 'warning', 12),
    );
  }

  if (usesCanvas) {
    const drawOperations = countMatches(script, DRAW_OPERATION_PATTERN);
    if (drawOperations < 4) {
      diagnostics.push(
        diagnostic(
          'component.canvas.empty_risk',
          'Canvas components must draw a substantial first frame immediately.',
          'error',
          35,
        ),
      );
    }
    if (!/\bonMounted\s*\(/.test(script)) {
      diagnostics.push(
        diagnostic('component.canvas.no_mount_draw', 'Canvas must draw during onMounted.', 'error', 30),
      );
    }
    if (!/(?:ResizeObserver|addEventListener\s*\(\s*['"]resize)/.test(script)) {
      diagnostics.push(
        diagnostic('component.canvas.no_resize', 'Canvas must redraw responsively when its surface changes.', 'warning', 10),
      );
    }
  }

  if (usesSvg && countMatches(template, SVG_SHAPE_PATTERN) < 3) {
    diagnostics.push(
      diagnostic('component.svg.sparse', 'The SVG scene is too sparse to communicate a useful model.', 'warning', 10),
    );
  }
  if (mapDomain && !hasFiveVisibleDomainItems(template, script)) {
    diagnostics.push(
      diagnostic(
        'component.map.sparse_first_frame',
        'Maps, atlases, forests, and cities need at least five visible local regions or landmarks initially.',
        'error',
        30,
      ),
    );
  }

  if (template.length < 220) {
    diagnostics.push(
      diagnostic('component.template.too_small', 'The rendered experience is too slight to be useful.', 'warning', 12),
    );
  }
  if (style.length < 420) {
    diagnostics.push(
      diagnostic('component.style.too_small', 'The visual system is too underdeveloped for a finished component.', 'warning', 10),
    );
  }
  if (!RESPONSIVE_PATTERN.test(style)) {
    diagnostics.push(
      diagnostic('component.layout.not_responsive', 'Use fluid responsive sizing for compact and run modes.', 'warning', 10),
    );
  }
  if (LARGE_FIXED_SURFACE_PATTERN.test(style)) {
    diagnostics.push(
      diagnostic('component.layout.fixed_surface', 'Avoid large fixed pixel surfaces.', 'warning', 10),
    );
  }
  if (NORMAL_SCROLL_PATTERN.test(style)) {
    diagnostics.push(
      diagnostic('component.layout.internal_scroll', 'Normal use should not require internal scrolling.', 'warning', 8),
    );
  }
  if (!/:focus-visible/.test(style)) {
    diagnostics.push(
      diagnostic('component.accessibility.focus', 'Provide a visible keyboard focus state.', 'warning', 6),
    );
  }
  if (!/prefers-reduced-motion/.test(style)) {
    diagnostics.push(
      diagnostic('component.accessibility.motion', 'Include a reduced-motion fallback.', 'warning', 5),
    );
  }
  if (!/globalThis\.Dot\s*\?\?/.test(script)) {
    diagnostics.push(
      diagnostic('component.dot.no_fallback', 'The component needs a standalone Dot fallback.', 'warning', 10),
    );
  }
  if (/(?:Simulation Output|Zoom In|Zoom Out)/i.test(template) && interactions <= 2) {
    diagnostics.push(
      diagnostic(
        'component.antipattern.generic_controls',
        'Generic output or zoom controls cannot be the whole experience.',
        'warning',
        18,
      ),
    );
  }
  if (/\b(?:TODO|coming soon|lorem ipsum)\b/i.test(source)) {
    diagnostics.push(
      diagnostic('component.placeholder', 'Placeholder content is not a finished component.', 'warning', 18),
    );
  }

  const hardValid = !diagnostics.some((item) => item.severity === 'error');
  const score = Math.max(0, Math.min(100, 100 - diagnostics.reduce((total, item) => total + item.penalty, 0)));
  return {
    component: true,
    hardValid,
    passed: hardValid && score >= QUALITY_THRESHOLD,
    score,
    diagnostics: diagnostics.map(({ penalty: _penalty, ...item }) => item),
    metrics: {
      interactions,
      directInteractions,
      dynamicVisuals,
      mutableState,
      derivedState,
      usesCanvas,
      usesSvg,
    },
  };
}

function visitArtifacts(artifacts, visitor) {
  for (const artifact of Array.isArray(artifacts) ? artifacts : []) {
    visitor(artifact);
    visitArtifacts(artifact?.children, visitor);
  }
}

function componentArtifacts(artifacts) {
  const components = [];
  visitArtifacts(artifacts, (artifact) => {
    if (artifact?.kind === 'component') components.push(artifact);
  });
  return components;
}

export function findComponentRepairTarget(artifacts, report) {
  const components = componentArtifacts(artifacts);
  if (!components.length) return { artifact: null, index: -1 };

  const failingIndex = Array.isArray(report?.componentReports)
    ? report.componentReports.findIndex((componentReport) => !componentReport?.passed)
    : -1;
  const index = failingIndex >= 0 && components[failingIndex] ? failingIndex : 0;
  return { artifact: components[index], index };
}

export function mergeComponentRepairArtifacts(initialArtifacts, repairedArtifacts, targetIndex) {
  const replacement = componentArtifacts(repairedArtifacts)[0] ?? null;
  if (targetIndex < 0) {
    return { artifacts: repairedArtifacts, replaced: false };
  }
  if (!replacement) {
    return {
      artifacts: Array.isArray(initialArtifacts) ? initialArtifacts : [],
      replaced: false,
      targetMissing: true,
    };
  }

  let componentIndex = -1;
  let replaced = false;

  function visit(artifact) {
    if (!artifact || typeof artifact !== 'object') return artifact;
    if (artifact.kind === 'component') {
      componentIndex += 1;
      if (componentIndex === targetIndex) {
        replaced = true;
        return {
          ...replacement,
          children:
            Array.isArray(replacement.children) && replacement.children.length
              ? replacement.children
              : Array.isArray(artifact.children)
                ? artifact.children
                : [],
        };
      }
    }

    return {
      ...artifact,
      children: Array.isArray(artifact.children) ? artifact.children.map(visit) : [],
    };
  }

  return {
    artifacts: Array.isArray(initialArtifacts) ? initialArtifacts.map(visit) : [],
    replaced,
  };
}

export function inspectGeneratedArtifacts(artifacts, { preferredKind, requestPrompt = '' } = {}) {
  const reports = [];
  visitArtifacts(artifacts, (artifact) => {
    if (artifact?.kind === 'component') {
      reports.push({
        title: artifact.title || 'Untitled component',
        ...inspectComponentArtifact(artifact, { requestPrompt }),
      });
    }
  });

  const diagnostics = [];
  if (!Array.isArray(artifacts) || !artifacts.length) {
    diagnostics.push({
      code: 'response.artifacts.empty',
      message: 'The model returned no artifacts.',
      severity: 'error',
    });
  }
  if (preferredKind === 'component' && !reports.length) {
    diagnostics.push({
      code: 'response.component.missing',
      message: 'A component was requested but no component was returned.',
      severity: 'error',
    });
  }
  for (const report of reports) {
    for (const item of report.diagnostics) {
      diagnostics.push({ ...item, artifact: report.title });
    }
  }

  const hardValid =
    !diagnostics.some((item) => item.severity === 'error') && reports.every((report) => report.hardValid);
  const score = reports.length
    ? Math.round(reports.reduce((total, report) => total + report.score, 0) / reports.length)
    : preferredKind === 'component'
      ? 0
      : 100;

  return {
    passed: hardValid && reports.every((report) => report.passed),
    hardValid,
    score,
    diagnostics: diagnostics.slice(0, 16),
    componentReports: reports,
  };
}

export const componentQualityThreshold = QUALITY_THRESHOLD;
