import { NEST_EXTRA_HEIGHT } from './constants';
import type { Artifact } from './types';

export function getChildArtifacts(artifacts: Artifact[], parentId: string) {
  return artifacts.filter((artifact) => artifact.parentId === parentId);
}

export function getParentArtifact(artifacts: Artifact[], artifact: Artifact) {
  return artifact.parentId ? artifacts.find((item) => item.id === artifact.parentId) ?? null : null;
}

export function getArtifactRenderHeight(artifacts: Artifact[], artifact: Artifact) {
  return artifact.height + (getChildArtifacts(artifacts, artifact.id).length ? NEST_EXTRA_HEIGHT : 0);
}

export function isDescendantOf(artifacts: Artifact[], possibleChildId: string, possibleParentId: string): boolean {
  let current = artifacts.find((artifact) => artifact.id === possibleChildId);

  while (current?.parentId) {
    if (current.parentId === possibleParentId) return true;
    current = artifacts.find((artifact) => artifact.id === current?.parentId);
  }

  return false;
}

export function canNestArtifact(artifacts: Artifact[], deletingArtifactIds: string[], child: Artifact, parent: Artifact) {
  return (
    child.id !== parent.id &&
    !child.parentId &&
    !parent.parentId &&
    !deletingArtifactIds.includes(child.id) &&
    !deletingArtifactIds.includes(parent.id) &&
    !isDescendantOf(artifacts, parent.id, child.id)
  );
}
