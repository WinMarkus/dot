import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: '1mb' }));

const portSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'label', 'type', 'purpose'],
  properties: {
    id: { type: 'string' },
    label: { type: 'string' },
    type: { enum: ['text', 'image', 'video', 'data', 'event', 'component', 'any'] },
    purpose: { type: 'string' },
  },
};

const portsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['inputs', 'outputs'],
  properties: {
    inputs: { type: 'array', maxItems: 8, items: portSchema },
    outputs: { type: 'array', maxItems: 8, items: portSchema },
  },
};

const contentSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['text', 'description', 'imagePrompt', 'storyboard', 'vue', 'html', 'css', 'js', 'data'],
  properties: {
    text: { type: 'string' },
    description: { type: 'string' },
    imagePrompt: { type: 'string' },
    storyboard: { type: 'array', maxItems: 8, items: { type: 'string' } },
    vue: { type: 'string' },
    html: { type: 'string' },
    css: { type: 'string' },
    js: { type: 'string' },
    data: { type: 'object', additionalProperties: true },
  },
};

function makeArtifactSchema(childrenSchema) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['kind', 'title', 'purpose', 'summary', 'content', 'ports', 'children'],
    properties: {
      kind: { enum: ['text', 'object', 'image', 'video', 'component'] },
      title: { type: 'string', minLength: 1, maxLength: 64 },
      purpose: { type: 'string', minLength: 1, maxLength: 360 },
      summary: { type: 'string', minLength: 1, maxLength: 700 },
      content: contentSchema,
      ports: portsSchema,
      children: childrenSchema,
    },
  };
}

const childArtifactSchema = makeArtifactSchema({ type: 'array', maxItems: 0, items: { type: 'object' } });
const rootArtifactSchema = makeArtifactSchema({ type: 'array', maxItems: 6, items: childArtifactSchema });

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['artifacts'],
  properties: {
    artifacts: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: rootArtifactSchema,
    },
  },
};

function buildSystemPrompt() {
  return `You generate artifacts for Dot, a spatial creation canvas.

Return ONLY valid JSON:
{
  "artifacts": [
    {
      "kind": "text | object | image | video | component",
      "title": "short title",
      "purpose": "why this exists",
      "summary": "how it should be understood",
      "content": {
        "text": "",
        "description": "",
        "imagePrompt": "",
        "storyboard": [],
        "vue": "",
        "html": "",
        "css": "",
        "js": "",
        "data": {}
      },
      "ports": { "inputs": [], "outputs": [] },
      "children": []
    }
  ]
}

If connectedInputs are provided, they are living context flowing into this artifact through its connections on the canvas. Weave them in meaningfully: a forest connected to trees knows those trees; a component connected to an image and a text should actually use them.

Hard rules:
1. If preferredKind is given, follow it unless the prompt clearly contradicts it.
2. If the user explicitly asks for an image, video, text, or component, return exactly ONE primary artifact of that kind.
3. Use object only for plans, lists, structures, semantic containers, inventories, rules, or ambiguous prompts.
4. For image artifacts, put a rich, concrete image-generation prompt in content.imagePrompt (subject, style, mood, lighting). Do not turn it into a semantic object unless explicitly asked.
5. For video artifacts, put the useful result in content.storyboard.
6. For text artifacts, put the useful result in content.text.
7. For component artifacts, put a complete Vue 3 single-file component in content.vue and leave html/css/js empty. Rules for content.vue:
   - exactly one <template>, one <script>, and optionally one <style> block
   - the script must use "export default { ... }" (Options API or a setup() function) — never <script setup>
   - Vue is available as the global "Vue"; destructure what you need, e.g. const { ref, computed } = Vue
   - no import statements, no external scripts or stylesheets, no network calls
   - make it feel alive: real interactivity and tasteful self-contained styling
8. Only create children when the user clearly asks for a structure or hierarchy.
9. Prefer obeying the user's obvious intent over being clever.

Be concrete and useful.`;
}

function safeString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function inferPreferredKind(prompt, fallback = 'object') {
  const text = safeString(prompt).toLowerCase();

  if (/\b(component|html|css|javascript|js|vue|react|button|form|counter|widget|calculator|input|modal)\b/.test(text)) {
    return 'component';
  }

  if (/\b(video|animation|animated|clip|movie|trailer|gif)\b/.test(text)) {
    return 'video';
  }

  if (/\b(image|photo|picture|illustration|poster|logo|icon|draw|drawing|visual)\b/.test(text)) {
    return 'image';
  }

  if (/\b(write|text|story|poem|essay|article|copy|headline|markdown|explain|summary)\b/.test(text)) {
    return 'text';
  }

  const normalizedFallback = safeString(fallback, 'object');
  return ['text', 'object', 'image', 'video', 'component'].includes(normalizedFallback) ? normalizedFallback : 'object';
}

function compactCanvasContext(canvasContext) {
  return {
    artifacts: safeArray(canvasContext?.artifacts)
      .slice(0, 12)
      .map((artifact) => ({
        title: safeString(artifact?.title).slice(0, 60),
        kind: safeString(artifact?.kind, 'object'),
        parentId: artifact?.parentId ?? null,
        ports: {
          inputs: safeArray(artifact?.ports?.inputs)
            .slice(0, 3)
            .map((port) => safeString(port?.label).slice(0, 40)),
          outputs: safeArray(artifact?.ports?.outputs)
            .slice(0, 3)
            .map((port) => safeString(port?.label).slice(0, 40)),
        },
      })),
  };
}

function compactSelectedArtifact(selectedArtifact) {
  if (!selectedArtifact) return null;

  return {
    kind: safeString(selectedArtifact.kind, 'object'),
    title: safeString(selectedArtifact.title, 'Artifact').slice(0, 60),
    prompt: safeString(selectedArtifact.prompt).slice(0, 240),
    purpose: safeString(selectedArtifact?.content?.purpose).slice(0, 240),
    summary: safeString(selectedArtifact?.content?.summary).slice(0, 320),
    ports: {
      inputs: safeArray(selectedArtifact?.content?.ports?.inputs)
        .slice(0, 4)
        .map((port) => ({ label: safeString(port?.label).slice(0, 40), type: safeString(port?.type, 'any') })),
      outputs: safeArray(selectedArtifact?.content?.ports?.outputs)
        .slice(0, 4)
        .map((port) => ({ label: safeString(port?.label).slice(0, 40), type: safeString(port?.type, 'any') })),
    },
  };
}

function buildUserPayload(body) {
  const preferredKind =
    safeString(body?.preferredKind) || inferPreferredKind(body?.prompt, safeString(body?.selectedArtifact?.kind, 'object'));

  return {
    mode: safeString(body?.mode, 'create'),
    prompt: safeString(body?.prompt),
    preferredKind,
    selectedArtifact: compactSelectedArtifact(body?.selectedArtifact),
    connectedInputs: safeArray(body?.connectedInputs)
      .slice(0, 6)
      .map((input) => ({
        meaning: safeString(input?.meaning).slice(0, 80),
        kind: safeString(input?.kind, 'object'),
        title: safeString(input?.title).slice(0, 60),
        content: safeString(input?.content).slice(0, 600),
      })),
    canvasContext: compactCanvasContext(body?.canvasContext),
  };
}

function safePort(port, index, direction) {
  const type = ['text', 'image', 'video', 'data', 'event', 'component', 'any'].includes(port?.type) ? port.type : 'any';
  return {
    id: safeString(port?.id, `${direction}_${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40),
    label: safeString(port?.label, `${direction} ${index + 1}`).slice(0, 60),
    type,
    purpose: safeString(port?.purpose, 'Potential connection point.').slice(0, 180),
  };
}

function normalizeArtifact(input, depth = 0) {
  const allowedKinds = new Set(['text', 'object', 'image', 'video', 'component']);
  const kind = allowedKinds.has(input?.kind) ? input.kind : 'object';
  const content = input?.content && typeof input.content === 'object' ? input.content : {};
  const ports = input?.ports && typeof input.ports === 'object' ? input.ports : {};

  return {
    kind,
    title: safeString(input?.title, 'Artifact').slice(0, 64),
    purpose: safeString(input?.purpose, 'A generated canvas artifact.').slice(0, 360),
    summary: safeString(input?.summary, 'Generated by the model.').slice(0, 700),
    content: {
      text: safeString(content.text),
      description: safeString(content.description || content.imagePrompt || content.text || input?.summary),
      imagePrompt: safeString(content.imagePrompt || content.description),
      storyboard: safeArray(content.storyboard).map((item) => safeString(item)).filter(Boolean).slice(0, 8),
      vue: safeString(content.vue),
      html: safeString(content.html),
      css: safeString(content.css),
      js: safeString(content.js),
      data: content.data && typeof content.data === 'object' && !Array.isArray(content.data) ? content.data : {},
    },
    ports: {
      inputs: safeArray(ports.inputs).slice(0, 8).map((port, index) => safePort(port, index, 'input')),
      outputs: safeArray(ports.outputs).slice(0, 8).map((port, index) => safePort(port, index, 'output')),
    },
    children: depth >= 1 ? [] : safeArray(input?.children).slice(0, 6).map((child) => normalizeArtifact(child, depth + 1)),
  };
}

function extractJsonObject(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match?.[1]) return match[1].trim();

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);

  return trimmed;
}

function logGeneration(event, data = {}) {
  console.info(`[dot:generate] ${event}`, JSON.stringify(data));
}

function logGenerationError(event, data = {}) {
  console.error(`[dot:generate] ${event}`, JSON.stringify(data));
}

const DEFAULT_TEXT_MODEL = () => process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';
const DEFAULT_IMAGE_MODEL = () => process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-3.1-flash-lite-image';

const MODEL_CATALOG_TTL_MS = 60 * 60 * 1000;
let modelCatalogCache = { fetchedAt: 0, catalog: null };

const TEXT_MODEL_FAMILIES = [
  /^openai\/gpt-/,
  /^anthropic\/claude-/,
  /^google\/gemini-/,
  /^deepseek\//,
  /^meta-llama\/llama-/,
  /^mistralai\//,
  /^x-ai\/grok-/,
  /^qwen\/qwen/,
];

function toModelOption(model) {
  return {
    id: safeString(model?.id),
    name: safeString(model?.name, safeString(model?.id)),
    promptPricePerMillion: Number(model?.pricing?.prompt ?? 0) * 1_000_000,
  };
}

async function fetchModelCatalog() {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) throw new Error(`OpenRouter models request failed: ${response.status}`);

  const payload = await response.json();
  const models = safeArray(payload?.data).filter((model) => safeString(model?.id));
  const byNewest = (a, b) => (b?.created ?? 0) - (a?.created ?? 0);

  const imageModels = models
    .filter((model) => safeArray(model?.architecture?.output_modalities).includes('image'))
    .sort(byNewest)
    .map(toModelOption);

  const textCandidates = models.filter((model) => {
    const outputs = safeArray(model?.architecture?.output_modalities);
    // Guard/moderation classifiers produce labels, not artifacts.
    if (/guard|safety|moderation/i.test(model.id)) return false;
    return outputs.includes('text') && !outputs.includes('image');
  });

  const familyModels = TEXT_MODEL_FAMILIES.flatMap((family) =>
    textCandidates
      .filter((model) => family.test(model.id))
      .sort(byNewest)
      .slice(0, 2),
  );

  // Cost-free options deserve a spot regardless of family.
  const freeModels = textCandidates
    .filter((model) => model.id.endsWith(':free'))
    .sort(byNewest)
    .slice(0, 4);

  const seen = new Set();
  const textModels = [...freeModels, ...familyModels]
    .filter((model) => !seen.has(model.id) && seen.add(model.id))
    .map(toModelOption);

  return { textModels, imageModels };
}

async function getModelCatalog() {
  const isFresh = modelCatalogCache.catalog && Date.now() - modelCatalogCache.fetchedAt < MODEL_CATALOG_TTL_MS;
  if (isFresh) return modelCatalogCache.catalog;

  try {
    const catalog = await fetchModelCatalog();
    modelCatalogCache = { fetchedAt: Date.now(), catalog };
    logGeneration('model_catalog_refreshed', { textModels: catalog.textModels.length, imageModels: catalog.imageModels.length });
    return catalog;
  } catch (error) {
    logGenerationError('model_catalog_failure', { message: error.message });
    // A stale catalog beats no catalog.
    return modelCatalogCache.catalog;
  }
}

function ensureModelInList(list, id) {
  if (id && !list.some((option) => option.id === id)) {
    // No pricing claim here — the price is simply unknown for injected defaults.
    list.unshift({ id, name: id });
  }
}

async function resolveRequestedModel(requested, kind) {
  const id = safeString(requested).trim().slice(0, 120);
  if (!id) return null;
  if (id === DEFAULT_TEXT_MODEL() || id === DEFAULT_IMAGE_MODEL()) return id;

  const catalog = await getModelCatalog();
  // Without a catalog we cannot validate; trust the client on its own deployment.
  if (!catalog) return id;

  const list = kind === 'image' ? catalog.imageModels : catalog.textModels;
  if (list.some((option) => option.id === id)) return id;

  logGenerationError('model_rejected', { requested: id, kind });
  return null;
}

function buildOpenRouterRequestBody(model, body, responseFormat) {
  return {
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: JSON.stringify(buildUserPayload(body)) },
    ],
    // Some models (notably :free variants) reject response_format entirely;
    // in plain mode we rely on the prompt plus extractJsonObject instead.
    ...(responseFormat ? { response_format: responseFormat } : {}),
    temperature: 0.3,
    max_tokens: 3200,
  };
}

async function requestOpenRouter(apiKey, model, body, responseFormat, providerMode) {
  const userPayload = buildUserPayload(body);

  logGeneration('openrouter_attempt', {
    model,
    providerMode,
    preferredKind: userPayload.preferredKind,
    promptLength: safeString(userPayload.prompt).length,
    mode: safeString(userPayload.mode, 'create'),
    canvasArtifacts: safeArray(userPayload?.canvasContext?.artifacts).length,
  });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Dot',
    },
    body: JSON.stringify(buildOpenRouterRequestBody(model, body, responseFormat)),
  });

  if (!response.ok) {
    const detail = await response.text();
    logGenerationError('openrouter_failure', {
      model,
      providerMode,
      status: response.status,
      detail: detail.slice(0, 900),
    });

    const error = new Error(`OpenRouter request failed: ${response.status}`);
    error.statusCode = response.status;
    error.detail = detail.slice(0, 2000);
    throw error;
  }

  logGeneration('openrouter_success', { model, providerMode, status: response.status });
  return response.json();
}

function parseOpenRouterPayload(payload, model, providerMode) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    const error = new Error('OpenRouter response did not contain text content');
    error.statusCode = 502;
    throw error;
  }

  const parsed = JSON.parse(extractJsonObject(content));
  const artifacts = safeArray(parsed.artifacts).slice(0, 4).map((artifact) => normalizeArtifact(artifact));

  logGeneration('openrouter_parsed', {
    model: payload.model || model,
    providerMode,
    artifactCount: artifacts.length,
    totalTokens: payload?.usage?.total_tokens ?? null,
  });

  return {
    artifacts,
    provider: `openrouter:${providerMode}`,
    model: payload.model || model,
    usage: payload.usage || null,
  };
}

async function callOpenRouter(body, modelOverride) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENROUTER_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }

  const model = modelOverride || DEFAULT_TEXT_MODEL();
  const strictJsonSchemaFormat = {
    type: 'json_schema',
    json_schema: {
      name: 'dot_artifact_response',
      strict: true,
      schema: responseSchema,
    },
  };

  try {
    const payload = await requestOpenRouter(apiKey, model, body, strictJsonSchemaFormat, 'json_schema');
    return parseOpenRouterPayload(payload, model, 'json_schema');
  } catch (schemaError) {
    if (schemaError.statusCode !== 400 && schemaError.statusCode !== 404) throw schemaError;

    logGeneration('openrouter_retry', {
      model,
      from: 'json_schema',
      to: 'json_object',
    });

    try {
      const payload = await requestOpenRouter(apiKey, model, body, { type: 'json_object' }, 'json_object');
      return parseOpenRouterPayload(payload, model, 'json_object');
    } catch (jsonObjectError) {
      if (jsonObjectError.statusCode !== 400 && jsonObjectError.statusCode !== 404) throw jsonObjectError;

      logGeneration('openrouter_retry', {
        model,
        from: 'json_object',
        to: 'plain',
      });

      try {
        const payload = await requestOpenRouter(apiKey, model, body, null, 'plain');
        return parseOpenRouterPayload(payload, model, 'plain');
      } catch (plainError) {
        plainError.detail = JSON.stringify({
          jsonSchemaError: schemaError.detail || schemaError.message,
          jsonObjectError: jsonObjectError.detail || jsonObjectError.message,
          plainError: plainError.detail || plainError.message,
        }).slice(0, 2400);
        throw plainError;
      }
    }
  }
}

async function callOpenRouterImage(prompt, modelOverride) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENROUTER_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }

  const model = modelOverride || DEFAULT_IMAGE_MODEL();

  logGeneration('image_attempt', { model, promptLength: prompt.length });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Dot',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text'],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    logGenerationError('image_failure', { model, status: response.status, detail: detail.slice(0, 900) });

    const error = new Error(`OpenRouter image request failed: ${response.status}`);
    error.statusCode = response.status;
    error.detail = detail.slice(0, 2000);
    throw error;
  }

  const payload = await response.json();
  const image = payload?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    logGenerationError('image_empty', { model, finishReason: payload?.choices?.[0]?.finish_reason ?? null });

    const error = new Error('OpenRouter response did not contain an image');
    error.statusCode = 502;
    throw error;
  }

  logGeneration('image_success', {
    model: payload.model || model,
    bytes: image.length,
    totalTokens: payload?.usage?.total_tokens ?? null,
  });

  return { image, model: payload.model || model, usage: payload.usage || null };
}

app.post('/api/generate-image', async (request, response) => {
  const startedAt = Date.now();
  const prompt = safeString(request.body?.prompt).trim().slice(0, 2000);

  if (!prompt) {
    response.status(400).json({ error: 'Prompt is required' });
    logGenerationError('image_rejected', { reason: 'missing_prompt' });
    return;
  }

  try {
    const modelOverride = await resolveRequestedModel(request.body?.model, 'image');
    const result = await callOpenRouterImage(prompt, modelOverride);
    response.json(result);
    logGeneration('image_request_success', { durationMs: Date.now() - startedAt, model: result.model });
  } catch (error) {
    const statusCode = Number(error.statusCode ?? 500);
    logGenerationError('image_request_failure', {
      durationMs: Date.now() - startedAt,
      statusCode,
      message: error.message || 'Image generation failed',
      detail: safeString(error.detail).slice(0, 900),
    });

    response.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: error.message || 'Image generation failed',
      detail: error.detail || null,
    });
  }
});

const DEFAULT_SUGGEST_MODEL = () => process.env.OPENROUTER_SUGGEST_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';

const suggestionResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['suggestions'],
  properties: {
    suggestions: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'title', 'prompt', 'reason'],
        properties: {
          kind: { enum: ['text', 'object', 'image', 'video', 'component'] },
          title: { type: 'string', minLength: 1, maxLength: 48 },
          prompt: { type: 'string', minLength: 1, maxLength: 280 },
          reason: { type: 'string', minLength: 1, maxLength: 120 },
        },
      },
    },
  },
};

function buildSuggestSystemPrompt() {
  return `You are the imagination engine of Dot, a spatial canvas where anything can be created and connected to anything.

Given the artifact the user just made or selected (plus what else is on the canvas), propose up to 3 next artifacts that would be exciting to create and conceptually connect to it.

Think in expansions of scale (tree -> forest -> world), complements (image -> caption text), and transformations (image + text -> a component that renders them, e.g. as a printable page).

Rules:
- Each suggestion must be a different kind of leap. Never suggest a near-duplicate of the artifact or of anything already on the canvas.
- "prompt" is the full creation prompt the generator will receive. Make it concrete and self-contained.
- "title" is 2-4 words shown on a small ghost bubble.
- "reason" is one short sentence on why this connects.
- Return ONLY valid JSON: {"suggestions": [{"kind": "...", "title": "...", "prompt": "...", "reason": "..."}]}`;
}

function normalizeSuggestion(input) {
  const allowedKinds = new Set(['text', 'object', 'image', 'video', 'component']);
  return {
    kind: allowedKinds.has(input?.kind) ? input.kind : 'object',
    title: safeString(input?.title, 'Next idea').slice(0, 48),
    prompt: safeString(input?.prompt).slice(0, 280),
    reason: safeString(input?.reason).slice(0, 120),
  };
}

app.post('/api/suggest', async (request, response) => {
  const startedAt = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    response.status(503).json({ error: 'OPENROUTER_API_KEY is not configured' });
    return;
  }

  const artifact = request.body?.artifact;
  if (!artifact || typeof artifact !== 'object') {
    response.status(400).json({ error: 'artifact is required' });
    return;
  }

  const model = DEFAULT_SUGGEST_MODEL();
  const userPayload = {
    artifact: {
      kind: safeString(artifact.kind, 'object'),
      title: safeString(artifact.title).slice(0, 60),
      prompt: safeString(artifact.prompt).slice(0, 240),
      purpose: safeString(artifact.purpose).slice(0, 240),
      summary: safeString(artifact.summary).slice(0, 320),
    },
    canvasContext: compactCanvasContext(request.body?.canvasContext),
  };

  const requestBody = (responseFormat) => ({
    model,
    messages: [
      { role: 'system', content: buildSuggestSystemPrompt() },
      { role: 'user', content: JSON.stringify(userPayload) },
    ],
    ...(responseFormat ? { response_format: responseFormat } : {}),
    temperature: 0.8,
    max_tokens: 600,
  });

  async function callSuggest(responseFormat, providerMode) {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Dot',
      },
      body: JSON.stringify(requestBody(responseFormat)),
    });

    if (!openRouterResponse.ok) {
      const detail = await openRouterResponse.text();
      const error = new Error(`OpenRouter suggest request failed: ${openRouterResponse.status}`);
      error.statusCode = openRouterResponse.status;
      error.detail = detail.slice(0, 900);
      throw error;
    }

    const payload = await openRouterResponse.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      const error = new Error('OpenRouter suggest response did not contain text content');
      error.statusCode = 502;
      throw error;
    }

    const parsed = JSON.parse(extractJsonObject(content));
    const suggestions = safeArray(parsed.suggestions).slice(0, 3).map(normalizeSuggestion).filter((item) => item.prompt);

    logGeneration('suggest_success', { model: payload.model || model, providerMode, count: suggestions.length });
    return { suggestions, model: payload.model || model };
  }

  try {
    let result;
    try {
      result = await callSuggest(
        { type: 'json_schema', json_schema: { name: 'dot_suggestions', strict: true, schema: suggestionResponseSchema } },
        'json_schema',
      );
    } catch (schemaError) {
      if (schemaError.statusCode !== 400 && schemaError.statusCode !== 404) throw schemaError;
      try {
        result = await callSuggest({ type: 'json_object' }, 'json_object');
      } catch (jsonObjectError) {
        if (jsonObjectError.statusCode !== 400 && jsonObjectError.statusCode !== 404) throw jsonObjectError;
        result = await callSuggest(null, 'plain');
      }
    }

    response.json(result);
    logGeneration('suggest_request_success', { durationMs: Date.now() - startedAt, model: result.model, count: result.suggestions.length });
  } catch (error) {
    const statusCode = Number(error.statusCode ?? 500);
    logGenerationError('suggest_request_failure', {
      durationMs: Date.now() - startedAt,
      statusCode,
      message: error.message || 'Suggestion failed',
      detail: safeString(error.detail).slice(0, 600),
    });

    response.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: error.message || 'Suggestion failed',
    });
  }
});

const groupActionResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['actions'],
  properties: {
    actions: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'kind', 'title', 'prompt', 'reason'],
        properties: {
          id: { type: 'string', minLength: 1, maxLength: 40 },
          kind: { enum: ['text', 'object', 'image', 'video', 'component'] },
          title: { type: 'string', minLength: 1, maxLength: 48 },
          prompt: { type: 'string', minLength: 1, maxLength: 520 },
          reason: { type: 'string', minLength: 1, maxLength: 140 },
        },
      },
    },
  },
};

function buildGroupActionSystemPrompt() {
  return `You are the action imagination engine of Dot, a spatial creation canvas.

The user has lassoed a constellation of artifacts and is asking: “what could these become together?”
Return 2 to 4 distinct, immediately useful transformations. These are not navigation commands or generic CRUD actions; each must create one meaningful new artifact from the selected sources.

Rules:
- Read the selected artifact kinds and content. Propose transformations that make semantic use of every source whenever possible.
- For text-only constellations, favour actions such as distil, compare, rewrite, or make a printable composition.
- For text + image + component constellations, favour a concrete interactive experience, a story interface, narration, or an input/output transformation.
- "kind" is the kind of result to generate. A printable composition should be a component or text artifact, never claim to produce a binary PDF.
- "title" is 2-4 evocative words shown inside a small action bubble.
- "prompt" is the full, self-contained instruction sent to the artifact generator. It must say how to use the selected sources.
- "reason" is a quiet, specific explanation of the transformation.
- Every action must be materially different from the others.
- Return ONLY valid JSON: {"actions": [{"id":"...","kind":"...","title":"...","prompt":"...","reason":"..."}]}.`;
}

function normalizeGroupAction(input, index) {
  const allowedKinds = new Set(['text', 'object', 'image', 'video', 'component']);
  const id = safeString(input?.id, `action_${index + 1}`).toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 40) || `action_${index + 1}`;
  return {
    id,
    kind: allowedKinds.has(input?.kind) ? input.kind : 'object',
    title: safeString(input?.title, 'Make something').slice(0, 48),
    prompt: safeString(input?.prompt).slice(0, 520),
    reason: safeString(input?.reason, 'A new shape for this constellation.').slice(0, 140),
  };
}

function compactGroupActionArtifacts(value) {
  return safeArray(value)
    .slice(0, 8)
    .map((artifact) => ({
      id: safeString(artifact?.id).slice(0, 80),
      kind: safeString(artifact?.kind, 'object'),
      title: safeString(artifact?.title, 'Artifact').slice(0, 60),
      prompt: safeString(artifact?.prompt).slice(0, 240),
      purpose: safeString(artifact?.purpose).slice(0, 240),
      summary: safeString(artifact?.summary).slice(0, 320),
      content: safeString(artifact?.content).slice(0, 800),
      ports: artifact?.ports && typeof artifact.ports === 'object' ? artifact.ports : { inputs: [], outputs: [] },
    }))
    .filter((artifact) => artifact.id && artifact.title);
}

app.post('/api/group-actions', async (request, response) => {
  const startedAt = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;
  const artifacts = compactGroupActionArtifacts(request.body?.artifacts);

  if (!apiKey) {
    response.status(503).json({ error: 'OPENROUTER_API_KEY is not configured' });
    return;
  }

  if (artifacts.length < 2) {
    response.status(400).json({ error: 'At least two artifacts are required' });
    return;
  }

  const model = DEFAULT_SUGGEST_MODEL();
  const userPayload = {
    artifacts,
    canvasContext: compactCanvasContext(request.body?.canvasContext),
  };

  const requestBody = (responseFormat) => ({
    model,
    messages: [
      { role: 'system', content: buildGroupActionSystemPrompt() },
      { role: 'user', content: JSON.stringify(userPayload) },
    ],
    ...(responseFormat ? { response_format: responseFormat } : {}),
    temperature: 0.72,
    max_tokens: 900,
  });

  async function callGroupActions(responseFormat, providerMode) {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Dot',
      },
      body: JSON.stringify(requestBody(responseFormat)),
    });

    if (!openRouterResponse.ok) {
      const detail = await openRouterResponse.text();
      const error = new Error(`OpenRouter group action request failed: ${openRouterResponse.status}`);
      error.statusCode = openRouterResponse.status;
      error.detail = detail.slice(0, 900);
      throw error;
    }

    const payload = await openRouterResponse.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      const error = new Error('OpenRouter group action response did not contain text content');
      error.statusCode = 502;
      throw error;
    }

    const parsed = JSON.parse(extractJsonObject(content));
    const actions = safeArray(parsed.actions).slice(0, 4).map(normalizeGroupAction).filter((action) => action.prompt);
    logGeneration('group_actions_success', { model: payload.model || model, providerMode, count: actions.length });
    return { actions, model: payload.model || model };
  }

  try {
    let result;
    try {
      result = await callGroupActions(
        { type: 'json_schema', json_schema: { name: 'dot_group_actions', strict: true, schema: groupActionResponseSchema } },
        'json_schema',
      );
    } catch (schemaError) {
      if (schemaError.statusCode !== 400 && schemaError.statusCode !== 404) throw schemaError;
      try {
        result = await callGroupActions({ type: 'json_object' }, 'json_object');
      } catch (jsonObjectError) {
        if (jsonObjectError.statusCode !== 400 && jsonObjectError.statusCode !== 404) throw jsonObjectError;
        result = await callGroupActions(null, 'plain');
      }
    }

    response.json(result);
    logGeneration('group_actions_request_success', { durationMs: Date.now() - startedAt, model: result.model, count: result.actions.length });
  } catch (error) {
    const statusCode = Number(error.statusCode ?? 500);
    logGenerationError('group_actions_request_failure', {
      durationMs: Date.now() - startedAt,
      statusCode,
      message: error.message || 'Group action suggestion failed',
      detail: safeString(error.detail).slice(0, 600),
    });
    response.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: error.message || 'Group action suggestion failed',
    });
  }
});

app.post('/api/connect', async (request, response) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    response.status(503).json({ error: 'OPENROUTER_API_KEY is not configured' });
    return;
  }

  const from = request.body?.from;
  const to = request.body?.to;
  if (!from || !to || typeof from !== 'object' || typeof to !== 'object') {
    response.status(400).json({ error: 'from and to artifacts are required' });
    return;
  }

  const model = DEFAULT_SUGGEST_MODEL();
  const compact = (artifact) => ({
    kind: safeString(artifact.kind, 'object'),
    title: safeString(artifact.title).slice(0, 60),
    summary: safeString(artifact.summary || artifact.prompt).slice(0, 240),
  });

  const requestBody = (responseFormat) => ({
    model,
    messages: [
      {
        role: 'system',
        content: `You name relationships between artifacts on Dot, a living canvas where anything can connect to anything.

Given FROM (the giving end) and TO (the receiving end), respond with the meaning of this connection: a 2-4 word phrase, lowercase, poetic but precise, describing how FROM flows into TO. Examples: "grows within", "gives words to", "sets the mood of", "feeds data into", "echoes the pattern of".

Return ONLY valid JSON: {"meaning": "..."}`,
      },
      { role: 'user', content: JSON.stringify({ from: compact(from), to: compact(to) }) },
    ],
    ...(responseFormat ? { response_format: responseFormat } : {}),
    temperature: 0.7,
    max_tokens: 400,
  });

  async function callConnect(responseFormat) {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Dot',
      },
      body: JSON.stringify(requestBody(responseFormat)),
    });

    if (!openRouterResponse.ok) {
      const detail = await openRouterResponse.text();
      const error = new Error(`OpenRouter connect request failed: ${openRouterResponse.status}`);
      error.statusCode = openRouterResponse.status;
      error.detail = detail.slice(0, 600);
      throw error;
    }

    const payload = await openRouterResponse.json();
    const content = payload?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(extractJsonObject(safeString(content, '{}')));
    const meaning = safeString(parsed?.meaning).toLowerCase().slice(0, 60).trim();

    if (!meaning) {
      const error = new Error('OpenRouter connect response contained no meaning');
      error.statusCode = 502;
      throw error;
    }

    return { meaning, model: payload.model || model };
  }

  try {
    let result;
    try {
      result = await callConnect({ type: 'json_object' });
    } catch (jsonError) {
      if (jsonError.statusCode !== 400 && jsonError.statusCode !== 404) throw jsonError;
      result = await callConnect(null);
    }

    response.json(result);
    logGeneration('connect_success', { model: result.model, meaning: result.meaning });
  } catch (error) {
    const statusCode = Number(error.statusCode ?? 500);
    logGenerationError('connect_failure', { statusCode, message: error.message || 'Connect failed' });
    response.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: error.message || 'Connect failed',
    });
  }
});

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, providerConfigured: Boolean(process.env.OPENROUTER_API_KEY) });
});

app.get('/api/models', async (_request, response) => {
  const defaults = { text: DEFAULT_TEXT_MODEL(), image: DEFAULT_IMAGE_MODEL() };
  const catalog = await getModelCatalog();
  const textModels = [...(catalog?.textModels ?? [])];
  const imageModels = [...(catalog?.imageModels ?? [])];

  ensureModelInList(textModels, defaults.text);
  ensureModelInList(imageModels, defaults.image);

  response.json({ textModels, imageModels, defaults });
});

app.post('/api/generate', async (request, response) => {
  const startedAt = Date.now();
  const prompt = safeString(request.body?.prompt).trim();
  const mode = safeString(request.body?.mode, 'create');
  const preferredKind =
    safeString(request.body?.preferredKind) || inferPreferredKind(prompt, safeString(request.body?.selectedArtifact?.kind, 'object'));

  logGeneration('request_start', {
    mode,
    preferredKind,
    promptLength: prompt.length,
    selectedKind: safeString(request.body?.selectedArtifact?.kind, null),
    canvasArtifacts: safeArray(request.body?.canvasContext?.artifacts).length,
  });

  try {
    if (!prompt && mode !== 'regenerate') {
      response.status(400).json({ error: 'Prompt is required' });
      logGenerationError('request_rejected', { reason: 'missing_prompt' });
      return;
    }

    const modelOverride = await resolveRequestedModel(request.body?.model, 'text');
    const result = await callOpenRouter(
      {
        prompt,
        mode,
        preferredKind,
        selectedArtifact: request.body?.selectedArtifact ?? null,
        connectedInputs: request.body?.connectedInputs ?? [],
        canvasContext: request.body?.canvasContext ?? { artifacts: [] },
      },
      modelOverride,
    );

    response.json(result);
    logGeneration('request_success', {
      durationMs: Date.now() - startedAt,
      provider: result.provider,
      model: result.model,
      artifactCount: result.artifacts.length,
    });
  } catch (error) {
    const statusCode = Number(error.statusCode ?? 500);
    logGenerationError('request_failure', {
      durationMs: Date.now() - startedAt,
      statusCode,
      message: error.message || 'Generation failed',
      detail: safeString(error.detail).slice(0, 900),
    });

    response.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: error.message || 'Generation failed',
      detail: error.detail || null,
    });
  }
});

app.use(express.static(distDir));
app.get('*', (_request, response) => {
  response.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Dot server listening on ${port}`);
});
