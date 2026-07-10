export type Point = { x: number; y: number };

export type Viewport = {
  width: number;
  height: number;
};

export type ArtifactKind = 'text' | 'object' | 'image' | 'video' | 'component' | 'unknown';

export type PromptMode = { type: 'create' } | { type: 'edit'; artifactId: string };

export type ArtifactFacet = {
  label: string;
  value: string;
};

export type ArtifactPortType = 'text' | 'image' | 'video' | 'data' | 'event' | 'component' | 'any';

export type ArtifactPort = {
  id: string;
  label: string;
  type: ArtifactPortType;
  purpose: string;
};

export type ArtifactPorts = {
  inputs: ArtifactPort[];
  outputs: ArtifactPort[];
};

export type ArtifactContent = {
  raw: string;
  text?: string;
  markdown?: string;
  description?: string;
  tags?: string[];
  capabilities?: string[];
  connections?: string[];
  facets?: ArtifactFacet[];
  alt?: string;
  storyboard?: string[];
  summary?: string;
  purpose?: string;
  imagePrompt?: string;
  imageUrl?: string;
  imageStatus?: 'pending' | 'ready' | 'error';
  vue?: string;
  html?: string;
  css?: string;
  js?: string;
  data?: Record<string, unknown>;
  ports?: ArtifactPorts;
  provider?: string;
  model?: string;
};

export type Artifact = {
  id: string;
  kind: ArtifactKind;
  title: string;
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: string;
  content: ArtifactContent;
  parentId?: string;
};

export type GeneratedArtifact = {
  kind: ArtifactKind;
  title: string;
  purpose?: string;
  summary?: string;
  content: ArtifactContent;
  ports?: ArtifactPorts;
  children?: GeneratedArtifact[];
};

export type ArtifactConnection = {
  id: string;
  fromId: string;
  toId: string;
  meaning: string;
  createdAt: string;
};

export type GroupAction = {
  id: string;
  title: string;
  prompt: string;
  reason: string;
  kind: ArtifactKind;
};

export type ConnectedInput = {
  meaning: string;
  kind: ArtifactKind;
  title: string;
  content: string;
};

export type DeletedMarker = {
  id: string;
  artifact: Artifact;
  title: string;
  x: number;
  y: number;
  createdAt: string;
};

export type DragState = {
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

export type CameraState = {
  x: number;
  y: number;
  zoom: number;
};
