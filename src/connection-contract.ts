import type { Artifact, ArtifactPort, ArtifactPortType } from './types';
import { livingTypesAreCompatible } from './living-runtime';

export type ConnectionBinding = {
  fromPort?: ArtifactPort;
  toPort?: ArtifactPort;
  policy: 'live' | 'breathe' | 'event';
};

function compatibilityScore(output: ArtifactPort, input: ArtifactPort) {
  if (!livingTypesAreCompatible(output.type, input.type)) return -1;
  if (output.type === input.type) return output.type === 'event' ? 7 : 6;
  if (output.type === 'any' || input.type === 'any') return 4;
  if (output.type === 'component' && input.type === 'data') return 2;
  return 1;
}

export function chooseConnectionBinding(from: Artifact, to: Artifact): ConnectionBinding {
  const outputs = from.content.ports?.outputs ?? [];
  const inputs = to.content.ports?.inputs ?? [];
  let best: { fromPort: ArtifactPort; toPort: ArtifactPort; score: number } | null = null;

  for (const fromPort of outputs) {
    for (const toPort of inputs) {
      const score = compatibilityScore(fromPort, toPort);
      if (score < 0 || (best && score <= best.score)) continue;
      best = { fromPort, toPort, score };
    }
  }

  if (!best) return { policy: 'breathe' };

  const isEvent =
    best.fromPort.type === 'event' ||
    best.toPort.type === 'event' ||
    best.fromPort.mode === 'event' ||
    best.toPort.mode === 'event';

  return {
    fromPort: best.fromPort,
    toPort: best.toPort,
    policy: to.kind === 'component' ? (isEvent ? 'event' : 'live') : 'breathe',
  };
}

function readableText(artifact: Artifact) {
  return (
    artifact.content.text ||
    artifact.content.markdown ||
    artifact.content.description ||
    artifact.content.summary ||
    artifact.content.raw ||
    artifact.prompt
  );
}

function valueForType(artifact: Artifact, type: ArtifactPortType): unknown {
  if (type === 'text') return readableText(artifact);
  if (type === 'image') {
    return {
      url: artifact.content.imageUrl || '',
      prompt: artifact.content.imagePrompt || artifact.content.description || artifact.prompt,
      alt: artifact.content.alt || artifact.title,
    };
  }
  if (type === 'video') {
    return {
      storyboard: artifact.content.storyboard ?? [],
      description: artifact.content.description || artifact.content.summary || artifact.prompt,
    };
  }
  if (type === 'data' || type === 'component') {
    return artifact.content.data ?? {
      title: artifact.title,
      kind: artifact.kind,
      purpose: artifact.content.purpose || '',
      summary: artifact.content.summary || readableText(artifact),
    };
  }
  if (type === 'any') {
    return artifact.content.data ?? artifact.content.imageUrl ?? artifact.content.storyboard ?? readableText(artifact);
  }
  return undefined;
}

export function readArtifactOutput(artifact: Artifact, portId?: string) {
  if (portId && Object.prototype.hasOwnProperty.call(artifact.runtime?.outputs ?? {}, portId)) {
    return artifact.runtime?.outputs[portId];
  }

  const port = artifact.content.ports?.outputs.find((candidate) => candidate.id === portId);
  return port ? valueForType(artifact, port.type) : readableText(artifact);
}

export function connectionPortLabel(artifact: Artifact, portId?: string) {
  if (!portId) return '';
  return artifact.content.ports?.inputs.find((port) => port.id === portId)?.label ??
    artifact.content.ports?.outputs.find((port) => port.id === portId)?.label ??
    portId;
}

export function isDeclaredOutput(artifact: Artifact, portId: string) {
  return Boolean(artifact.content.ports?.outputs.some((port) => port.id === portId));
}
