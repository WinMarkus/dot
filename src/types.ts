export type Point = { x: number; y: number };

export type Viewport = {
  width: number;
  height: number;
};

export type ArtifactKind = 'text' | 'object' | 'image' | 'video' | 'unknown';

export type PromptMode = { type: 'create' } | { type: 'edit'; artifactId: string };

export type ArtifactFacet = {
  label: string;
  value: string;
};

export type ArtifactContent = {
  raw: string;
  markdown?: string;
  description?: string;
  tags?: string[];
  capabilities?: string[];
  connections?: string[];
  facets?: ArtifactFacet[];
  alt?: string;
  storyboard?: string[];
  summary?: string;
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
  content: ArtifactContent;
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
