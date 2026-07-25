export type ParsedSfc = {
  template: string;
  script: string;
  style: string;
};

type SfcBlock = {
  attributes: string;
  content: string;
  start: number;
  end: number;
};

export class VueSfcValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VueSfcValidationError';
  }
}

function whitespaceRange(source: string, start: number, end: number) {
  return `${source.slice(0, start)}${source
    .slice(start, end)
    .replace(/[^\r\n]/g, ' ')}${source.slice(end)}`;
}

function collectSimpleBlocks(source: string, tag: 'script' | 'style') {
  const opening = new RegExp(`<${tag}\\b([^>]*)>`, 'gi');
  const closing = new RegExp(`</${tag}\\s*>`, 'gi');
  const blocks: SfcBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = opening.exec(source))) {
    closing.lastIndex = opening.lastIndex;
    const close = closing.exec(source);
    if (!close) {
      throw new VueSfcValidationError(`The <${tag}> block is missing its closing </${tag}> tag.`);
    }

    blocks.push({
      attributes: match[1] ?? '',
      content: source.slice(opening.lastIndex, close.index),
      start: match.index,
      end: closing.lastIndex,
    });
    opening.lastIndex = closing.lastIndex;
  }

  return blocks;
}

// Root templates may contain nested <template v-if> or slot templates. This
// small scanner balances those tags instead of stopping at the first close.
function collectRootTemplateBlocks(source: string) {
  const tokens = /<\/?template\b[^>]*>/gi;
  const blocks: SfcBlock[] = [];
  let depth = 0;
  let openingStart = -1;
  let contentStart = -1;
  let attributes = '';
  let token: RegExpExecArray | null;

  while ((token = tokens.exec(source))) {
    const isClosing = /^<\//.test(token[0]);
    if (isClosing) {
      if (depth === 0) {
        throw new VueSfcValidationError('Found a closing </template> tag without a matching opening tag.');
      }
      depth -= 1;
      if (depth === 0) {
        blocks.push({
          attributes,
          content: source.slice(contentStart, token.index),
          start: openingStart,
          end: tokens.lastIndex,
        });
      }
      continue;
    }

    if (depth === 0) {
      openingStart = token.index;
      contentStart = tokens.lastIndex;
      attributes = token[0].replace(/^<template\b/i, '').replace(/>$/, '');
    }
    depth += 1;
  }

  if (depth !== 0) {
    throw new VueSfcValidationError('The <template> block is missing its closing </template> tag.');
  }

  return blocks;
}

function maskJavascriptCommentsAndStrings(source: string) {
  let result = '';
  let state: 'code' | 'single' | 'double' | 'template' | 'line-comment' | 'block-comment' = 'code';

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
    if (character === '\\' && (state === 'single' || state === 'double' || state === 'template')) {
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

function validatePlainScript(script: string) {
  if (!script.trim()) {
    throw new VueSfcValidationError('The <script> block must contain a component definition.');
  }

  const code = maskJavascriptCommentsAndStrings(script);
  if (/^\s*import(?:\s|["'{*])|\bimport\s*(?:\(|\.)/m.test(code)) {
    throw new VueSfcValidationError(
      'Imports are not supported in generated components. Use the global Vue object and inline data instead.',
    );
  }

  if (
    /\b(?:interface|enum|namespace|declare)\s+[A-Za-z_$]/.test(code) ||
    /(?:^|[;\n])\s*type\s+[A-Za-z_$][\w$]*\s*=/.test(code) ||
    /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*[?!]?\s*:\s*[A-Za-z_$]/.test(code) ||
    /\bfunction\b[^(\n]*\([^)\n]*\b[A-Za-z_$][\w$]*\??\s*:\s*(?:string|number|boolean|unknown|any|never|void|object|[A-Z][\w$]*)\b[^)\n]*\)/.test(
      code,
    ) ||
    /\([^)\n]*\b[A-Za-z_$][\w$]*\??\s*:\s*(?:string|number|boolean|unknown|any|never|void|object|[A-Z][\w$]*)\b[^)\n]*\)\s*(?::\s*[^=]+)?=>/.test(
      code,
    ) ||
    /\)\s*:\s*(?:string|number|boolean|unknown|any|never|void|object|[A-Z][\w$]*)\b\s*(?:=>|\{)/.test(
      code,
    ) ||
    /\s+as\s+(?:const|string|number|boolean|unknown|any|never|void|object|[A-Z][\w$]*)\b/.test(code)
  ) {
    throw new VueSfcValidationError(
      'TypeScript syntax is not supported in generated components. Return plain JavaScript.',
    );
  }

  const exportMatches = [...code.matchAll(/\bexport\s+default\b/g)];
  if (exportMatches.length !== 1) {
    throw new VueSfcValidationError(
      `The <script> block must contain exactly one export default component definition (found ${exportMatches.length}).`,
    );
  }
  if ([...code.matchAll(/\bexport\b/g)].length !== 1) {
    throw new VueSfcValidationError(
      'Named exports are not supported. The plain <script> block may only use one export default.',
    );
  }

  return exportMatches[0];
}

export function parseVueSfc(source: string): ParsedSfc {
  if (typeof source !== 'string' || !source.trim()) {
    throw new VueSfcValidationError('The generated Vue component is empty.');
  }

  const commentMasked = source.replace(/<!--[\s\S]*?-->/g, (comment) =>
    comment.replace(/[^\r\n]/g, ' '),
  );
  const scripts = collectSimpleBlocks(commentMasked, 'script');
  if (scripts.length !== 1) {
    throw new VueSfcValidationError(
      `A generated component needs exactly one plain <script> block (found ${scripts.length}).`,
    );
  }

  const scriptAttributes = scripts[0].attributes.trim();
  if (/\bsetup\b/i.test(scriptAttributes)) {
    throw new VueSfcValidationError('<script setup> is not supported. Use one plain <script> with export default.');
  }
  if (/\bsrc\s*=/i.test(scriptAttributes)) {
    throw new VueSfcValidationError('External script sources are not supported in generated components.');
  }
  if (/\blang\s*=\s*["']?(?:ts|tsx)\b/i.test(scriptAttributes)) {
    throw new VueSfcValidationError('TypeScript is not supported. Use a plain JavaScript <script> block.');
  }
  if (scriptAttributes) {
    throw new VueSfcValidationError('Use a plain <script> block without attributes.');
  }

  const templateSource = whitespaceRange(commentMasked, scripts[0].start, scripts[0].end);
  const templates = collectRootTemplateBlocks(templateSource);
  if (templates.length !== 1) {
    throw new VueSfcValidationError(
      `A generated component needs exactly one root <template> block (found ${templates.length}).`,
    );
  }
  if (templates[0].attributes.trim()) {
    throw new VueSfcValidationError('The root <template> block must not have attributes.');
  }
  if (!templates[0].content.trim()) {
    throw new VueSfcValidationError('The root <template> block must contain visible component markup.');
  }

  const styles = collectSimpleBlocks(templateSource, 'style');
  if (styles.length > 1) {
    throw new VueSfcValidationError(
      `A generated component may contain at most one plain <style> block (found ${styles.length}).`,
    );
  }
  if (styles[0]?.attributes.trim()) {
    throw new VueSfcValidationError(
      'Use a plain optional <style> block without scoped, module, lang, src, or other attributes.',
    );
  }

  const rootBlocks = [templates[0], scripts[0], ...styles].sort((left, right) => left.start - right.start);
  for (let index = 1; index < rootBlocks.length; index += 1) {
    if (rootBlocks[index].start < rootBlocks[index - 1].end) {
      throw new VueSfcValidationError(
        'The root <template>, <script>, and optional <style> blocks must be siblings and cannot be nested.',
      );
    }
  }
  let remainingRootSource = commentMasked;
  rootBlocks.forEach((block) => {
    remainingRootSource = whitespaceRange(remainingRootSource, block.start, block.end);
  });
  if (remainingRootSource.trim()) {
    const preview = remainingRootSource.trim().replace(/\s+/g, ' ').slice(0, 80);
    throw new VueSfcValidationError(
      `Only one root <template>, one plain <script>, and one optional plain <style> block are supported. Remove: ${preview}`,
    );
  }

  const script = source.slice(
    scripts[0].start + source.slice(scripts[0].start, scripts[0].end).indexOf('>') + 1,
    scripts[0].end - source.slice(scripts[0].start, scripts[0].end).match(/<\/script\s*>$/i)![0].length,
  ).trim();
  validatePlainScript(script);

  return {
    template: templates[0].content.trim(),
    script,
    style: styles.map((block) => block.content.trim()).filter(Boolean).join('\n'),
  };
}

export function toComponentScriptBody(script: string) {
  const exportMatch = validatePlainScript(script);
  const start = exportMatch.index ?? 0;
  const end = start + exportMatch[0].length;
  return `${script.slice(0, start)}const __component__ =${script.slice(end)}`;
}
