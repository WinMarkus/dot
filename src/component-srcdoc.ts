import vueRuntimeUrl from 'vue/dist/vue.global.prod.js?url';
import type { ArtifactContent } from './types';
import { parseVueSfc, toComponentScriptBody } from './vue-sfc';

export const DOT_COMPONENT_BRIDGE_PROTOCOL = 'dot-component-bridge' as const;
export const DOT_COMPONENT_BRIDGE_VERSION = 1 as const;

export type DotComponentBridgeConnectMessage = {
  source: 'dot-host';
  protocol: typeof DOT_COMPONENT_BRIDGE_PROTOCOL;
  type: 'dot:bridge-connect';
  version: typeof DOT_COMPONENT_BRIDGE_VERSION;
  inputs?: Record<string, unknown>;
  revision?: number;
};

export type DotComponentBridgeRequestMessage = {
  source: 'dot-component';
  protocol: typeof DOT_COMPONENT_BRIDGE_PROTOCOL;
  type: 'dot:bridge-request';
  version: typeof DOT_COMPONENT_BRIDGE_VERSION;
};

export type DotComponentHostMessage =
  | {
      protocol: typeof DOT_COMPONENT_BRIDGE_PROTOCOL;
      type: 'dot:inputs';
      version: typeof DOT_COMPONENT_BRIDGE_VERSION;
      inputs: Record<string, unknown>;
      revision?: number;
    }
  | {
      protocol: typeof DOT_COMPONENT_BRIDGE_PROTOCOL;
      type: 'dot:input';
      version: typeof DOT_COMPONENT_BRIDGE_VERSION;
      portId: string;
      value?: unknown;
      unset?: boolean;
      revision?: number;
    };

export type DotComponentFrameMessage =
  | {
      protocol: typeof DOT_COMPONENT_BRIDGE_PROTOCOL;
      type: 'dot:ready';
      version: typeof DOT_COMPONENT_BRIDGE_VERSION;
      capabilities: readonly ['inputs', 'outputs', 'resize', 'errors'];
    }
  | {
      protocol: typeof DOT_COMPONENT_BRIDGE_PROTOCOL;
      type: 'dot:emit';
      version: typeof DOT_COMPONENT_BRIDGE_VERSION;
      portId: string;
      value: unknown;
    }
  | {
      protocol: typeof DOT_COMPONENT_BRIDGE_PROTOCOL;
      type: 'dot:resize';
      version: typeof DOT_COMPONENT_BRIDGE_VERSION;
      width: number;
      height: number;
    }
  | {
      protocol: typeof DOT_COMPONENT_BRIDGE_PROTOCOL;
      type: 'dot:error';
      version: typeof DOT_COMPONENT_BRIDGE_VERSION;
      message: string;
      phase?: string;
      stack?: string;
    };

function escapeClosingTags(value: string) {
  return value.replace(/<\/script/gi, '<\\/script').replace(/<\/style/gi, '<\\/style');
}

// Safe way to embed arbitrary text inside an inline <script>: JSON string with
// every "<" escaped so "</script>" can never terminate the surrounding tag.
function toJsLiteral(value: string) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

// This code is deliberately self-contained: it runs inside a sandboxed srcdoc,
// where imports and network access are disabled by CSP. Runtime data is accepted
// only through the MessagePort explicitly transferred by the owning parent.
const DOT_RUNTIME_BOOTSTRAP = `(function installDotRuntime() {
      'use strict';

      const PROTOCOL = ${toJsLiteral(DOT_COMPONENT_BRIDGE_PROTOCOL)};
      const VERSION = ${DOT_COMPONENT_BRIDGE_VERSION};
      const rawInputs = Object.create(null);
      const reactiveInputs = window.Vue && typeof window.Vue.reactive === 'function'
        ? window.Vue.reactive(rawInputs)
        : rawInputs;
      const publicInputs = window.Vue && typeof window.Vue.readonly === 'function'
        ? window.Vue.readonly(reactiveInputs)
        : reactiveInputs;
      const pending = [];
      let activePort = null;
      let lastRevision = -1;
      let lastWidth = -1;
      let lastHeight = -1;
      let resizeFrame = 0;
      let componentReady = false;

      function packet(type, fields) {
        return Object.assign({ protocol: PROTOCOL, version: VERSION, type: type }, fields || {});
      }

      function enqueue(message) {
        if (message.type === 'dot:resize' || message.type === 'dot:ready') {
          const existing = pending.findIndex((item) => item.type === message.type);
          if (existing >= 0) pending.splice(existing, 1);
        }
        pending.push(message);
        if (pending.length > 128) pending.splice(0, pending.length - 128);
      }

      function send(message) {
        if (!activePort) {
          enqueue(message);
          return true;
        }
        try {
          activePort.postMessage(message);
          return true;
        } catch (error) {
          return false;
        }
      }

      function reportError(error, phase) {
        const message = String(error && error.message || error || 'Unknown component error').slice(0, 4000);
        const stack = error && typeof error.stack === 'string' ? error.stack.slice(0, 12000) : undefined;
        send(packet('dot:error', { message: message, phase: phase || undefined, stack: stack }));
      }

      function validRevision(revision) {
        if (!Number.isFinite(revision)) return true;
        if (revision < lastRevision) return false;
        lastRevision = revision;
        return true;
      }

      function notifyInputs(portId) {
        window.dispatchEvent(new CustomEvent('dot:inputs', {
          detail: { inputs: publicInputs, portId: portId, revision: lastRevision },
        }));
      }

      function replaceInputs(nextInputs, revision) {
        if (!nextInputs || typeof nextInputs !== 'object' || Array.isArray(nextInputs) || !validRevision(revision)) return;
        Object.keys(reactiveInputs).forEach((key) => {
          if (!Object.prototype.hasOwnProperty.call(nextInputs, key)) delete reactiveInputs[key];
        });
        Object.keys(nextInputs).forEach((key) => {
          reactiveInputs[key] = nextInputs[key];
        });
        notifyInputs();
      }

      function updateInput(portId, value, unset, revision) {
        if (typeof portId !== 'string' || !portId.trim() || !validRevision(revision)) return;
        if (unset) delete reactiveInputs[portId];
        else reactiveInputs[portId] = value;
        notifyInputs(portId);
      }

      function receive(event) {
        const message = event && event.data;
        if (!message || message.protocol !== PROTOCOL || message.version !== VERSION) return;
        if (message.type === 'dot:inputs') replaceInputs(message.inputs, message.revision);
        if (message.type === 'dot:input') updateInput(message.portId, message.value, message.unset, message.revision);
      }

      function connect(port, initialInputs, revision) {
        if (!port || typeof port.postMessage !== 'function') return;
        if (activePort && activePort !== port) activePort.close();
        activePort = port;
        activePort.onmessage = receive;
        activePort.onmessageerror = () => reportError('The host sent an unreadable input packet.', 'bridge');
        if (typeof activePort.start === 'function') activePort.start();
        if (initialInputs !== undefined) replaceInputs(initialInputs, revision);

        const queued = pending.splice(0);
        queued.forEach((message) => send(message));
        if (componentReady && !queued.some((message) => message.type === 'dot:ready')) {
          send(packet('dot:ready', { capabilities: ['inputs', 'outputs', 'resize', 'errors'] }));
        }
        scheduleResize();
      }

      function requestBridge() {
        if (activePort || window.parent === window) return;
        window.parent.postMessage({
          source: 'dot-component',
          protocol: PROTOCOL,
          type: 'dot:bridge-request',
          version: VERSION,
        }, '*');
      }

      function cloneOutput(value) {
        const unwrapped = window.Vue && typeof window.Vue.toRaw === 'function' ? window.Vue.toRaw(value) : value;
        return typeof structuredClone === 'function' ? structuredClone(unwrapped) : unwrapped;
      }

      function emit(portId, value) {
        if (typeof portId !== 'string' || !portId.trim()) {
          reportError('Dot.emit(portId, value) requires a non-empty port id.', 'emit');
          return false;
        }
        try {
          const emitted = send(packet('dot:emit', { portId: portId, value: cloneOutput(value) }));
          if (!emitted) reportError('The output could not be delivered to the host.', 'emit:' + portId);
          return emitted;
        } catch (error) {
          reportError(error, 'emit:' + portId);
          return false;
        }
      }

      function measure() {
        resizeFrame = 0;
        const root = document.documentElement;
        const body = document.body;
        if (!root || !body) return;
        const width = Math.ceil(Math.max(root.scrollWidth, body.scrollWidth, root.getBoundingClientRect().width, body.getBoundingClientRect().width));
        const height = Math.ceil(Math.max(root.scrollHeight, body.scrollHeight, root.getBoundingClientRect().height, body.getBoundingClientRect().height));
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width;
        lastHeight = height;
        send(packet('dot:resize', { width: width, height: height }));
      }

      function scheduleResize() {
        if (resizeFrame) return;
        resizeFrame = requestAnimationFrame(measure);
      }

      function observeSize() {
        scheduleResize();
        if (typeof ResizeObserver === 'function') {
          const observer = new ResizeObserver(scheduleResize);
          observer.observe(document.documentElement);
          if (document.body) observer.observe(document.body);
        } else {
          window.addEventListener('resize', scheduleResize);
        }
      }

      function ready() {
        componentReady = true;
        send(packet('dot:ready', { capabilities: ['inputs', 'outputs', 'resize', 'errors'] }));
        requestBridge();
        scheduleResize();
      }

      const api = {};
      Object.defineProperties(api, {
        inputs: { enumerable: true, value: publicInputs },
        emit: { enumerable: true, value: emit },
        connected: { enumerable: true, get: () => Boolean(activePort) },
        revision: { enumerable: true, get: () => lastRevision },
        version: { enumerable: true, value: VERSION },
      });
      Object.freeze(api);
      Object.defineProperty(window, 'Dot', { configurable: false, enumerable: true, value: api, writable: false });

      Object.defineProperty(window, '__DOT_COMPONENT_RUNTIME__', {
        configurable: false,
        value: Object.freeze({ ready: ready, reportError: reportError, scheduleResize: scheduleResize }),
        writable: false,
      });

      window.addEventListener('message', (event) => {
        const message = event.data;
        if (
          event.source !== window.parent ||
          !message ||
          message.source !== 'dot-host' ||
          message.protocol !== PROTOCOL ||
          message.type !== 'dot:bridge-connect' ||
          message.version !== VERSION
        ) return;
        connect(event.ports && event.ports[0], message.inputs, message.revision);
      });
      window.addEventListener('error', (event) => reportError(event.error || event.message, 'runtime'));
      window.addEventListener('unhandledrejection', (event) => reportError(event.reason, 'promise'));

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeSize, { once: true });
      else observeSize();
      window.addEventListener('load', () => setTimeout(requestBridge, 0), { once: true });
      requestBridge();
    })();`;

const ERROR_REPORTER = `function __reportError(error, phase) {
      window.__DOT_COMPONENT_RUNTIME__.reportError(error, phase);
      const errorEl = document.createElement('pre');
      errorEl.style.cssText = 'white-space:pre-wrap;color:#ffb4a8;background:rgba(0,0,0,.35);padding:10px;border-radius:12px;font:12px ui-monospace,monospace;';
      errorEl.textContent = 'Component error: ' + String(error && error.message || error);
      document.body.appendChild(errorEl);
    }`;

function createLegacySrcDoc(content: ArtifactContent) {
  const html = content.html || '<div class="empty">No component HTML generated.</div>';
  const css = content.css || '';
  const js = content.js || '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; media-src data: blob:;" />
  <style>
    html, body { width: 100%; min-height: 100%; margin: 0; background: transparent; }
    * { box-sizing: border-box; }
    ${escapeClosingTags(css)}
  </style>
  <script>
    ${DOT_RUNTIME_BOOTSTRAP}
    ${ERROR_REPORTER}
  <\/script>
</head>
<body>
  ${html}
  <script>
    try {
      ${escapeClosingTags(js)}
      window.__DOT_COMPONENT_RUNTIME__.ready();
    } catch (error) {
      __reportError(error, 'legacy');
    }
  <\/script>
</body>
</html>`;
}

function createVueSrcDoc(sfcSource: string) {
  const { template, script, style } = parseVueSfc(sfcSource);
  const origin = window.location.origin;
  const vueSrc = new URL(vueRuntimeUrl, origin).href;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- 'unsafe-eval' is required by Vue's runtime template compiler; the sandbox plus connect-src 'none' remains the security boundary. -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'unsafe-eval' ${origin}; img-src data: blob:; font-src data:; connect-src 'none'; media-src data: blob:;" />
  <style>
    html, body { width: 100%; min-height: 100%; margin: 0; background: transparent; }
    * { box-sizing: border-box; }
  </style>
  <script src="${vueSrc}"><\/script>
  <script>
    ${DOT_RUNTIME_BOOTSTRAP}
    ${ERROR_REPORTER}
  <\/script>
</head>
<body>
  <div id="app"></div>
  <script>
    try {
      const __style__ = ${toJsLiteral(style)};
      if (__style__) {
        const styleEl = document.createElement('style');
        styleEl.textContent = __style__;
        document.head.appendChild(styleEl);
      }

      ${escapeClosingTags(toComponentScriptBody(script))}

      const __definition__ = Object.assign({}, __component__, { template: ${toJsLiteral(template)} });
      const app = Vue.createApp(__definition__);
      app.config.errorHandler = (error, _instance, info) => __reportError(error, 'vue:' + info);
      app.mount('#app');
      Vue.nextTick(() => window.__DOT_COMPONENT_RUNTIME__.ready());
    } catch (error) {
      __reportError(error, 'vue:mount');
    }
  <\/script>
</body>
</html>`;
}

export function createComponentSrcDoc(content: ArtifactContent) {
  if (content.vue?.trim()) return createVueSrcDoc(content.vue);
  return createLegacySrcDoc(content);
}
