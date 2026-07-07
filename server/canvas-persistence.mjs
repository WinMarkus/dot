import http from 'node:http';
import { Buffer } from 'node:buffer';

const PATCH_FLAG = '__DOT_CANVAS_PERSISTENCE_PATCHED__';
const MAX_SNAPSHOT_BYTES = 900_000;

function safeString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function getConfig() {
  return {
    token: process.env.DOT_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '',
    repo: process.env.DOT_GITHUB_REPO || process.env.GITHUB_REPOSITORY || 'WinMarkus/dot',
    branch: process.env.DOT_GITHUB_BRANCH || 'main',
    path: process.env.DOT_CANVAS_PATH || '.dot/canvas.snapshot.json',
    saveToken: process.env.DOT_SAVE_TOKEN || '',
  };
}

function encodePath(filePath) {
  return filePath.split('/').map((part) => encodeURIComponent(part)).join('/');
}

function githubContentsUrl(config, withRef = true) {
  const url = new URL(`https://api.github.com/repos/${config.repo}/contents/${encodePath(config.path)}`);
  if (withRef) url.searchParams.set('ref', config.branch);
  return url.toString();
}

function githubHeaders(config) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${config.token}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw, 'utf8') > MAX_SNAPSHOT_BYTES) {
        reject(Object.assign(new Error('Canvas snapshot is too large'), { statusCode: 413 }));
        request.destroy();
      }
    });

    request.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error('Request body must be valid JSON'), { statusCode: 400 }));
      }
    });

    request.on('error', reject);
  });
}

async function fetchExistingSnapshotFile(config) {
  const response = await fetch(githubContentsUrl(config), {
    headers: githubHeaders(config),
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`GitHub snapshot read failed: ${response.status}`);
    error.statusCode = response.status;
    error.detail = detail.slice(0, 900);
    throw error;
  }

  const payload = await response.json();
  const encoded = safeString(payload?.content).replace(/\s/g, '');
  const content = Buffer.from(encoded, 'base64').toString('utf8');

  return {
    sha: safeString(payload?.sha),
    content,
  };
}

async function loadSnapshot(config) {
  const file = await fetchExistingSnapshotFile(config);
  if (!file) return { snapshot: null, sha: null };

  try {
    return { snapshot: JSON.parse(file.content), sha: file.sha };
  } catch {
    const error = new Error('Saved canvas snapshot is not valid JSON');
    error.statusCode = 502;
    throw error;
  }
}

async function saveSnapshot(config, snapshot) {
  const existing = await fetchExistingSnapshotFile(config);
  const content = JSON.stringify(snapshot, null, 2);
  const byteLength = Buffer.byteLength(content, 'utf8');

  if (byteLength > MAX_SNAPSHOT_BYTES) {
    const error = new Error(`Canvas snapshot is too large: ${byteLength} bytes`);
    error.statusCode = 413;
    throw error;
  }

  const body = {
    message: `Save Dot canvas snapshot (${new Date().toISOString()})`,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: config.branch,
    ...(existing?.sha ? { sha: existing.sha } : {}),
  };

  const response = await fetch(githubContentsUrl(config, false), {
    method: 'PUT',
    headers: githubHeaders(config),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`GitHub snapshot save failed: ${response.status}`);
    error.statusCode = response.status;
    error.detail = detail.slice(0, 900);
    throw error;
  }

  const payload = await response.json();
  return {
    commit: safeString(payload?.commit?.sha),
    path: config.path,
    branch: config.branch,
    bytes: byteLength,
  };
}

function hasValidSaveToken(request, config) {
  if (!config.saveToken) return true;
  return safeString(request.headers['x-dot-save-token']) === config.saveToken;
}

async function handleCanvasRequest(request, response) {
  const config = getConfig();

  if (!config.token) {
    sendJson(response, 503, {
      error: 'DOT_GITHUB_TOKEN or GITHUB_TOKEN is not configured',
      configured: false,
    });
    return;
  }

  try {
    if (request.method === 'GET') {
      const result = await loadSnapshot(config);
      sendJson(response, 200, {
        ok: true,
        configured: true,
        repo: config.repo,
        branch: config.branch,
        path: config.path,
        saveTokenConfigured: Boolean(config.saveToken),
        snapshot: result.snapshot,
      });
      return;
    }

    if (request.method === 'POST' || request.method === 'PUT') {
      if (!hasValidSaveToken(request, config)) {
        sendJson(response, 401, { error: 'Invalid or missing DOT_SAVE_TOKEN' });
        return;
      }

      const body = await readJsonBody(request);
      const snapshot = body?.snapshot;

      if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
        sendJson(response, 400, { error: 'snapshot object is required' });
        return;
      }

      const result = await saveSnapshot(config, snapshot);
      sendJson(response, 200, { ok: true, ...result });
      return;
    }

    if (request.method === 'OPTIONS') {
      sendJson(response, 204, {});
      return;
    }

    response.setHeader('Allow', 'GET, POST, PUT, OPTIONS');
    sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    const status = Number(error.statusCode ?? 500);
    sendJson(response, status >= 400 && status < 600 ? status : 500, {
      error: error.message || 'Canvas persistence failed',
      detail: error.detail || null,
    });
  }
}

function isCanvasRequest(request) {
  const url = new URL(request.url || '/', 'http://localhost');
  return url.pathname === '/api/canvas';
}

if (!globalThis[PATCH_FLAG]) {
  globalThis[PATCH_FLAG] = true;
  const originalCreateServer = http.createServer;

  http.createServer = function patchedCreateServer(options, listener) {
    const hasOptions = typeof options !== 'function';
    const originalListener = hasOptions ? listener : options;

    const wrappedListener = (request, response) => {
      if (isCanvasRequest(request)) {
        void handleCanvasRequest(request, response);
        return;
      }

      if (typeof originalListener === 'function') {
        originalListener(request, response);
        return;
      }

      response.statusCode = 404;
      response.end();
    };

    return hasOptions
      ? originalCreateServer.call(this, options, wrappedListener)
      : originalCreateServer.call(this, wrappedListener);
  };

  console.log('[dot:canvas] GitHub-backed canvas persistence endpoint installed at /api/canvas');
}
