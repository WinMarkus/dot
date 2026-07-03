import type { ArtifactContent } from './types';

function escapeClosingTags(value: string) {
  return value.replace(/<\/script/gi, '<\\/script').replace(/<\/style/gi, '<\\/style');
}

export function createComponentSrcDoc(content: ArtifactContent) {
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
    try {
      ${escapeClosingTags(js)}
    } catch (error) {
      document.body.insertAdjacentHTML('beforeend', '<pre style="white-space:pre-wrap;color:#ffb4a8;background:rgba(0,0,0,.35);padding:10px;border-radius:12px;font:12px ui-monospace,monospace;">Component error: ' + String(error && error.message || error) + '</pre>');
    }
  <\/script>
</body>
</html>`;
}
