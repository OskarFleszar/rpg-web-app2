import { useCallback, useRef, useState } from "react";
import { usePublish } from "../../../ws/hooks";
import type { Drawable, Stroke } from "../types";
import type Konva from "konva";
import { getPointerOnLayer } from "../utils/konvaCoords";
import { eraserHitsStroke } from "../utils/geometry";

export function useEraser(opts: {
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  radius: number;
  clientId: string;
  strokes: Stroke[];
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
  markPendingRemoval: (ids: string[]) => void;
  isMine: (id: string) => boolean;
}) {
  const {
    boardId,
    stageRef,
    layerRef,
    radius,
    clientId,
    strokes,
    markPendingRemoval,
    isMine,
  } = opts;
  const publish = usePublish();

  const hitsRef = useRef<Set<string>>(new Set());
  const [erasePreview, setErasePreview] = useState<Set<string>>(new Set());

  const isErasingRef = useRef(false);
  const trailRef = useRef<number[][]>([]);

  const onPointerDown = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (!pt) return;
    isErasingRef.current = true;
    hitsRef.current.clear();
    setErasePreview(new Set());
    trailRef.current = [[pt.x, pt.y]];
  }, [layerRef, stageRef]);

  const onPointerMove = useCallback(() => {
    if (!isErasingRef.current) return;
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (!pt) return;

    const t = trailRef.current;
    const last = t[t.length - 1];
    if (!last || (pt.x - last[0]) ** 2 + (pt.y - last[1]) ** 2 > 1) {
      t.push([pt.x, pt.y]);
    }

    const next = new Set(hitsRef.current);
    for (const s of strokes) {
      if (next.has(s.id)) continue;
      if (eraserHitsStroke(s.points, pt.x, pt.y, radius) && isMine(s.id))
        next.add(s.id);
    }
    if (next.size !== hitsRef.current.size) {
      hitsRef.current = next;
      setErasePreview(new Set(next));
    }
  }, [layerRef, stageRef, strokes, radius, isMine]);

  const onPointerUp = useCallback(() => {
    if (!isErasingRef.current) return;
    isErasingRef.current = false;

    const trail = trailRef.current;
    const touched = new Set<string>();

    for (const s of strokes) {
      for (const [x, y] of trail) {
        if (eraserHitsStroke(s.points, x, y, radius)) {
          touched.add(s.id);
          break;
        }
      }
    }

    trailRef.current = [];
    hitsRef.current.clear();
    setErasePreview(new Set());

    const ownIds = [...touched].filter(isMine);
    if (ownIds.length === 0) return;

    markPendingRemoval(ownIds);

    publish(`/app/board.${boardId}.op`, {
      type: "erase.commit",
      boardId,
      objectIds: ownIds,
      clientId,
    } as const);
  }, [boardId, clientId, publish, strokes, radius, isMine, markPendingRemoval]);

  return { onPointerDown, onPointerMove, onPointerUp, erasePreview };
}
