import { MAX_ZOOM, MIN_ZOOM } from './constants';
import type { CameraState, Point, Viewport } from './types';

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function screenToWorld(point: Point, camera: CameraState): Point {
  return {
    x: (point.x - camera.x) / camera.zoom,
    y: (point.y - camera.y) / camera.zoom,
  };
}

export function worldToScreen(point: Point, camera: CameraState): Point {
  return {
    x: point.x * camera.zoom + camera.x,
    y: point.y * camera.zoom + camera.y,
  };
}

export function centerCameraOn(point: Point, viewport: Viewport, zoom: number): CameraState {
  return {
    x: viewport.width / 2 - point.x * zoom,
    y: viewport.height / 2 - point.y * zoom,
    zoom,
  };
}

export function zoomCameraAt(screenPoint: Point, nextZoom: number, camera: CameraState): CameraState {
  const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const worldPoint = screenToWorld(screenPoint, camera);

  return {
    x: screenPoint.x - worldPoint.x * zoom,
    y: screenPoint.y - worldPoint.y * zoom,
    zoom,
  };
}

export function getViewportSafeWorldPoint(screenPoint: Point, camera: CameraState, viewport: Viewport): Point {
  return screenToWorld(
    {
      x: clamp(screenPoint.x, 28, viewport.width - 28),
      y: clamp(screenPoint.y, 28, viewport.height - 130),
    },
    camera,
  );
}
