import { ARTIFACT_HEIGHT, ARTIFACT_WIDTH } from './constants';
import type { Artifact, ArtifactContent, ArtifactKind, GeneratedArtifact, Point } from './types';

export function nowLabel() {
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

export function cloneArtifact(artifact: Artifact): Artifact {
  return JSON.parse(JSON.stringify(artifact)) as Artifact;
}

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function makeArtifactTitle(value: string) {
  const clean = value.trim().replace(/\s+/g, ' ');
  if (!clean) return 'Untitled artifact';
  return clean.length > 42 ? `${clean.slice(0, 39)}...` : clean;
}

function inferObjectTags(value: string) {
  const text = value.toLowerCase();
  const tags = ['semantic object'];

  if (/\b(list|item|collection|inventory)\b/.test(text)) tags.push('list');
  if (/\b(game|card|condition|rule|turn|score|player|level)\b/.test(text)) tags.push('game logic');
  if (/\b(plan|schedule|week|calendar|reminder|routine)\b/.test(text)) tags.push('plan');
  if (/\b(button|form|screen|page|ui|component|dashboard|modal|widget|vue|react)\b/.test(text)) tags.push('interface');
  if (/\b(data|table|csv|transform|calculate|number)\b/.test(text)) tags.push('data');

  return uniq(tags).slice(0, 4);
}

function inferConnections(value: string) {
  const text = value.toLowerCase();
  const connections = ['source', 'constraint', 'result'];

  if (/\b(list|item|collection|inventory)\b/.test(text)) connections.push('item', 'quantity', 'place');
  if (/\b(game|card|condition|rule)\b/.test(text)) connections.push('trigger', 'state', 'target');
  if (/\b(plan|schedule|week|calendar)\b/.test(text)) connections.push('date', 'task', 'dependency');
  if (/\b(button|form|screen|page|ui|component)\b/.test(text)) connections.push('input', 'event', 'view');

  return uniq(connections).slice(0, 6);
}

export function detectArtifactKind(value: string, fallback: ArtifactKind = 'unknown'): ArtifactKind {
  const text = value.toLowerCase();

  if (/\b(image|picture|photo|illustration|logo|icon|poster|visual|wallpaper)\b/.test(text)) return 'image';
  if (/\b(video|movie|clip|animation|trailer)\b/.test(text)) return 'video';
  if (/\b(text|copy|poem|story|essay|markdown|explain|write|article|headline)\b/.test(text)) return 'text';
  if (/\b(component|button|card|form|login|dashboard|widget|ui|vue|react|page|modal|plan|schedule|list|game|condition|rule|data|table|routine)\b/.test(text)) return 'object';

  return fallback;
}

function createObjectArtifactContent(value: string): ArtifactContent {
  return {
    raw: value,
    description: value,
    tags: inferObjectTags(value),
    connections: inferConnections(value),
    capabilities: ['accepts detail', 'can connect', 'can transform'],
    facets: [
      { label: 'role', value: 'semantic object' },
      { label: 'state', value: 'draft' },
    ],
    summary: 'Universal artifact shell. Meaning, capabilities, and connections are model-defined.',
  };
}

export function fakeGenerateArtifact(value: string, previous?: Artifact): GeneratedArtifact {
  const kind = detectArtifactKind(value, previous?.kind ?? 'unknown');
  const title = previous ? makeArtifactTitle(`${previous.title} · ${value}`) : makeArtifactTitle(value);

  if (kind === 'text') {
    const markdown = previous
      ? `### ${previous.title}\n\n${value}\n\nThis is the next written version of the artifact. The real generator will preserve intent, voice, and structure.`
      : `### ${title}\n\n${value}\n\nThis is a structured text artifact placeholder.`;

    return {
      kind,
      title,
      content: {
        raw: markdown,
        markdown,
        tags: ['text'],
        connections: ['source', 'reference', 'output'],
        capabilities: ['summarise', 'rewrite', 'connect'],
        summary: 'Text artifact with markdown preview.',
      },
    };
  }

  if (kind === 'object') {
    return {
      kind,
      title,
      content: createObjectArtifactContent(value),
    };
  }

  if (kind === 'image') {
    return {
      kind,
      title,
      content: {
        raw: `Image prompt: ${value}`,
        description: value,
        alt: `Generated image placeholder for: ${value}`,
        tags: ['visual'],
        connections: ['reference', 'style', 'output'],
        capabilities: ['describe', 'vary', 'connect'],
        summary: 'Image artifact placeholder.',
      },
    };
  }

  if (kind === 'video') {
    return {
      kind,
      title,
      content: {
        raw: `Video prompt: ${value}`,
        description: value,
        tags: ['motion'],
        connections: ['scene', 'timing', 'audio', 'output'],
        capabilities: ['storyboard', 'vary', 'connect'],
        storyboard: ['Opening frame', 'Main motion', 'End frame'],
        summary: 'Video artifact placeholder with storyboard beats.',
      },
    };
  }

  return {
    kind,
    title,
    content: {
      raw: value,
      tags: ['unclassified'],
      connections: ['source', 'meaning', 'output'],
      capabilities: ['classify', 'transform', 'connect'],
      summary: 'Unknown artifact type. This will later be resolved by the model router.',
    },
  };
}

export function createArtifactFromPrompt(value: string, position: Point): Artifact {
  const generated = fakeGenerateArtifact(value);

  return {
    id: crypto.randomUUID(),
    kind: generated.kind,
    title: generated.title,
    prompt: value,
    x: position.x,
    y: position.y,
    width: ARTIFACT_WIDTH,
    height: ARTIFACT_HEIGHT,
    createdAt: nowLabel(),
    content: generated.content,
  };
}
