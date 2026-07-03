import type { Artifact, ArtifactKind, ArtifactPorts, GeneratedArtifact } from './types';

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
  preferredKind?: ArtifactKind | null;
  selectedArtifact?: Artifact | null;
  canvasContext: {
    artifacts: CanvasArtifactContext[];
  };
};

export type GenerateArtifactsResponse = {
  artifacts: GeneratedArtifact[];
  provider?: string;
  model?: string;
  usage?: unknown;
};

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
