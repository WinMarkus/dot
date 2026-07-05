export type ParsedSfc = {
  template: string;
  script: string;
  style: string;
};

// Greedy match so nested <template v-slot> blocks stay inside the root template.
const TEMPLATE_BLOCK = /<template[^>]*>([\s\S]*)<\/template>/i;
const SCRIPT_BLOCK = /<script[^>]*>([\s\S]*?)<\/script>/i;
const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/i;

export function parseVueSfc(source: string): ParsedSfc {
  // Strip the script first so a stray </template> inside script strings cannot
  // extend the greedy template match past the template block.
  const script = source.match(SCRIPT_BLOCK)?.[1]?.trim() ?? '';
  const withoutScript = source.replace(SCRIPT_BLOCK, '');

  return {
    template: withoutScript.match(TEMPLATE_BLOCK)?.[1]?.trim() ?? '',
    script,
    style: withoutScript.match(STYLE_BLOCK)?.[1]?.trim() ?? '',
  };
}

export function toComponentScriptBody(script: string) {
  if (!script.trim()) return 'const __component__ = {};';

  if (/export\s+default/.test(script)) {
    return script.replace(/export\s+default/, 'const __component__ =');
  }

  return `${script}\nconst __component__ = {};`;
}
