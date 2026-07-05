import type { Artifact, ArtifactKind, ArtifactPorts, ConnectedInput, GeneratedArtifact } from './types';

export type GenerateMode = 'create' | 'edit' | 'regenerate';

export type CanvasArtifactContext = {
  id: string;
  kind: ArtifactKind;
  title: string;
  prompt: string;
  parentId: string | null;
  purpose: string;
  summary: string;
  ports: ArtifactPorts;
};

export type GenerateArtifactsRequest = {
  prompt: string;
  mode: GenerateMode;
  model?: string | null;
  preferredKind?: ArtifactKind | null;
  selectedArtifact?: Artifact | null;
  connectedInputs?: ConnectedInput[];
  canvasContext: {
    artifacts: CanvasArtifactContext[];
  };
};

export type ConnectionEndpoint = {
  kind: ArtifactKind;
  title: string;
  summary: string;
};

export async function nameConnection(from: ConnectionEndpoint, to: ConnectionEndpoint): Promise<string> {
  const response = await fetch('/api/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Connection naming failed with ${response.status}`);
  }

  const payload = (await response.json()) as { meaning?: string };
  if (!payload.meaning) throw new Error('Connection naming returned no meaning');
  return payload.meaning;
}

export type GenerateArtifactsResponse = {
  artifacts: GeneratedArtifact[];
  provider?: string;
  model?: string;
  usage?: unknown;
};

export type ArtifactSuggestion = {
  kind: ArtifactKind;
  title: string;
  prompt: string;
  reason: string;
};

export type SuggestArtifactsRequest = {
  artifact: {
    kind: ArtifactKind;
    title: string;
    prompt: string;
    purpose: string;
    summary: string;
  };
  canvasContext: {
    artifacts: CanvasArtifactContext[];
  };
};

export async function suggestNextArtifacts(request: SuggestArtifactsRequest): Promise<ArtifactSuggestion[]> {
  const response = await fetch('/api/suggest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Suggestion request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { suggestions?: ArtifactSuggestion[] };
  return Array.isArray(payload.suggestions) ? payload.suggestions.slice(0, 3) : [];
}

export type GenerateImageResponse = {
  image: string;
  model?: string;
};

export async function generateImageWithAi(prompt: string, model?: string | null): Promise<GenerateImageResponse> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model: model ?? undefined }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `Image generation failed with ${response.status}`);
  }

  const payload = (await response.json()) as GenerateImageResponse;
  if (typeof payload.image !== 'string' || !payload.image.startsWith('data:image/')) {
    throw new Error('Image generation returned no image');
  }

  return payload;
}

export async function generateArtifactsWithAi(request: GenerateArtifactsRequest): Promise<GenerateArtifactsResponse> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || `AI generation failed with ${response.status}`);
  }

  const payload = (await response.json()) as GenerateArtifactsResponse;
  if (!Array.isArray(payload.artifacts) || !payload.artifacts.length) {
    throw new Error('AI generation returned no artifacts');
  }

  return payload;
}
