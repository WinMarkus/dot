export type ModelOption = {
  id: string;
  name: string;
  promptPricePerMillion?: number;
};

export type ModelCatalog = {
  textModels: ModelOption[];
  imageModels: ModelOption[];
  defaults: { text: string; image: string };
};

export type ModelKind = 'text' | 'image';

const STORAGE_KEYS: Record<ModelKind, string> = {
  text: 'dot:model:text',
  image: 'dot:model:image',
};

export async function fetchModelCatalog(): Promise<ModelCatalog | null> {
  try {
    const response = await fetch('/api/models');
    if (!response.ok) return null;

    const payload = (await response.json()) as ModelCatalog;
    if (!Array.isArray(payload.textModels) || !Array.isArray(payload.imageModels)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function loadSavedModel(kind: ModelKind): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS[kind]);
  } catch {
    return null;
  }
}

export function saveModel(kind: ModelKind, id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS[kind], id);
  } catch {
    // Storage may be unavailable (private mode); selection still works for the session.
  }
}

export function shortModelName(id: string) {
  return id.split('/').pop() ?? id;
}

export function formatModelPrice(option: ModelOption) {
  const price = option.promptPricePerMillion;
  if (price == null) return '';
  if (!price) return 'free';
  return `$${price < 1 ? price.toFixed(2) : price.toFixed(0)}/M`;
}
