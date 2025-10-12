import type Konva from "konva";
import type React from "react";

export function getPointerOnLayer(
  stageRef: React.RefObject<Konva.Stage | null>,
  layerRef: React.RefObject<Konva.Layer | null>
): { x: number; y: number } | null {
  const stage = stageRef.current;
  const layer = layerRef.current;
  if (!stage || !layer) return null;

  const pos = stage.getPointerPosition();
  if (!pos) return null;

  const t = layer.getAbsoluteTransform().copy();
  t.invert();
  return t.point(pos);
}
