import vueRuntimeUrl from 'vue/dist/vue.global.prod.js?url';
import type { ArtifactContent } from './types';
import { parseVueSfc, toComponentScriptBody } from './vue-sfc';

function escapeClosingTags(value: string) {
  return value.replace(/<\/script/gi, '<\\/script').replace(/<\/style/gi, '<\\/style');
}

// Safe way to embed arbitrary text inside an inline <script>: JSON string with
// every "<" escaped so "</script>" can never terminate the surrounding tag.
function toJsLiteral(value: string) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

const ERROR_REPORTER = `function __reportError(error) {
      document.body.insertAdjacentHTML('beforeend', '<pre style="white-space:pre-wrap;color:#ffb4a8;background:rgba(0,0,0,.35);padding:10px;border-radius:12px;font:12px ui-monospace,monospace;">Component error: ' + String(error && error.message || error) + '</pre>');
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
</head>
<body>
  ${html}
  <script>
    ${ERROR_REPORTER}
    try {
      ${escapeClosingTags(js)}
    } catch (error) {
      __reportError(error);
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
</head>
<body>
  <div id="app"></div>
  <script>
    ${ERROR_REPORTER}
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
      app.config.errorHandler = (error) => __reportError(error);
      app.mount('#app');
    } catch (error) {
      __reportError(error);
    }
  <\/script>
</body>
</html>`;
}

export function createComponentSrcDoc(content: ArtifactContent) {
  if (content.vue?.trim()) return createVueSrcDoc(content.vue);
  return createLegacySrcDoc(content);
}
