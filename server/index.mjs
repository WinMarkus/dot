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

const artifactSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['kind', 'title', 'purpose', 'summary', 'content', 'ports', 'children'],
  properties: {
    kind: { enum: ['text', 'object', 'image', 'video', 'component'] },
    title: { type: 'string', minLength: 1, maxLength: 64 },
    purpose: { type: 'string', minLength: 1, maxLength: 360 },
    summary: { type: 'string', minLength: 1, maxLength: 700 },
    content: {
      type: 'object',
      additionalProperties: false,
      required: ['text', 'description', 'imagePrompt', 'storyboard', 'html', 'css', 'js', 'data'],
      properties: {
        text: { type: 'string' },
        description: { type: 'string' },
        imagePrompt: { type: 'string' },
        storyboard: { type: 'array', maxItems: 8, items: { type: 'string' } },
        html: { type: 'string' },
        css: { type: 'string' },
        js: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
      },
    },
    ports: {
      type: 'object',
      additionalProperties: false,
      required: ['inputs', 'outputs'],
      properties: {
        inputs: {
          type: 'array',
          maxItems: 8,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'label', 'type', 'purpose'],
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              type: { enum: ['text', 'image', 'video', 'data', 'event', 'component', 'any'] },
              purpose: { type: 'string' },
            },
          },
        },
        outputs: {
          type: 'array',
          maxItems: 8,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'label', 'type', 'purpose'],
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              type: { enum: ['text', 'image', 'video', 'data', 'event', 'component', 'any'] },
              purpose: { type: 'string' },
            },
          },
        },
      },
    },
    children: { type: 'array', maxItems: 6, items: { type: 'object', additionalProperties: false } },
  },
};

artifactSchema.properties.children.items = artifactSchema;

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['artifacts'],
  properties: {
    artifacts: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: artifactSchema,
    },
  },
};

function buildSystemPrompt() {
  return `You generate artifacts for Dot, a spatial creation canvas.

Do not answer the user directly. Create one or more living artifacts that can be rendered as bubbles on a canvas.

Each artifact must have:
- a concrete kind: text, object, image, video, or component
- a short title
- a purpose: why this object exists
- a summary: how it should be understood on the canvas
- content appropriate for its kind
- ports.inputs and ports.outputs describing possible future connections
- children for nested sub-artifacts, or []

Kind rules:
- text: prose, notes, instructions, stories, copy, explanations
- object: semantic/data/planning object; use for lists, plans, categories, inventories, game rules, task structures
- image: do not generate binary images; create a strong image prompt/spec
- video: do not generate binary video; create a storyboard/spec
- component: generate a small self-contained HTML/CSS/JS component. Keep it fun, simple, and sandbox-friendly. Do not use external scripts, external images, CDNs, network calls, storage, cookies, or imports.

For broad prompts, create a small useful structure with children.
For concrete prompts, create one strong artifact.
Prefer obvious usefulness over cleverness.
Return only JSON matching the schema.`;
}

function safeString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
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

async function callOpenRouter(body) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENROUTER_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }

  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

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
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: JSON.stringify(body) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'dot_artifact_response',
          strict: true,
          schema: responseSchema,
        },
      },
      temperature: 0.72,
      max_tokens: 3200,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`OpenRouter request failed: ${response.status}`);
    error.statusCode = response.status;
    error.detail = detail.slice(0, 1200);
    throw error;
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    const error = new Error('OpenRouter response did not contain text content');
    error.statusCode = 502;
    throw error;
  }

  const parsed = JSON.parse(extractJsonObject(content));
  return {
    artifacts: safeArray(parsed.artifacts).slice(0, 4).map((artifact) => normalizeArtifact(artifact)),
    provider: 'openrouter',
    model: payload.model || model,
    usage: payload.usage || null,
  };
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, providerConfigured: Boolean(process.env.OPENROUTER_API_KEY) });
});

app.post('/api/generate', async (request, response) => {
  try {
    const prompt = safeString(request.body?.prompt).trim();
    const mode = safeString(request.body?.mode, 'create');
    if (!prompt && mode !== 'regenerate') {
      response.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const result = await callOpenRouter({
      prompt,
      mode,
      selectedArtifact: request.body?.selectedArtifact ?? null,
      canvasContext: request.body?.canvasContext ?? { artifacts: [] },
    });

    response.json(result);
  } catch (error) {
    const statusCode = Number(error.statusCode ?? 500);
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
