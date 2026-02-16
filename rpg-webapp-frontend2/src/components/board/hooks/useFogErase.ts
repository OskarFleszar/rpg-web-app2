import { useCallback, useRef, useState } from "react";
import { usePublish } from "../../../ws/hooks";
import type Konva from "konva";

import { getPointerOnLayer } from "../utils/konvaCoords";
import { fallbackUUID } from "./usePencil";

export type FogStroke = {
  id: string;
  points: number[];
  radius: number;
};

export function useFogErase(opts: {
  active: boolean;
  campaignId: string;
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  radius: number;
  clientId: string;

  currentUserId: string;
}) {
  const { active, campaignId, boardId, stageRef, layerRef, radius, clientId } =
    opts;
  const publish = usePublish();

  const [fogStrokes, setFogStrokes] = useState<FogStroke[]>([]);

  const pendingPointsRef = useRef<number[][]>([]);
  const pathIdRef = useRef<string | null>(null);

  const onPointerDown = useCallback(() => {
    if (!active) return;
    pendingPointsRef.current.length = 0;
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (!pt) return;

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : fallbackUUID();
    pathIdRef.current = id;

    /*const opStart: StrokeStartOp = {
      type: "stroke.start",
      boardId,
      layerId: "base",
      pathId: id,
     
      width: strokeWidth,
      clientId,
      ownerId: currentUserId,
    };
    publish(`/app/board.${boardId}.op`, opStart);*/

    pendingPointsRef.current.push([pt.x, pt.y]);

    setFogStrokes((prev) => [
      ...prev,
      {
        id,
        points: [pt.x, pt.y],
        radius,
      },
    ]);
  }, [active, stageRef, layerRef, radius]);

  const onPointerMove = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    const pid = pathIdRef.current;
    if (!pt || !pid) return;

    setFogStrokes((prev) => {
      const idx = prev.findIndex((o) => o.id === pid);

      if (idx === -1) return prev;

      const stroke = prev[idx];

      const L = stroke.points.length;
      if (L >= 2) {
        const dx = pt.x - stroke.points[L - 2];
        const dy = pt.y - stroke.points[L - 1];
        const minDistSq = (radius * 0.25) ** 2;

        if (dx * dx + dy * dy < minDistSq) return prev;
      }

      pendingPointsRef.current.push([pt.x, pt.y]);

      const updated = { ...stroke, points: [...stroke.points, pt.x, pt.y] };
      const copy = prev.slice();
      copy[idx] = updated;

      return copy;
    });
  }, [layerRef, setFogStrokes, stageRef]);

  const onPointerUp = useCallback(() => {
    const pid = pathIdRef.current;
    pathIdRef.current = null;
    if (!pid) return;

    const points = pendingPointsRef.current;
    pendingPointsRef.current = [];

    publish(`/app/board.${boardId}.op`, {
      type: "fog.line.erased",
      boardId,
      campaignId,
      pathId: pid,
      points,
      radius,
      clientId,
    });
  }, [boardId, publish, clientId]);

  return {
    fogStrokes,
    setFogStrokes,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
