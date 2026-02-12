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
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  radius: number;
  clientId: string;
  addMyPath: (id: string) => void;
  removeMyPath: (id: string) => void;

  currentUserId: string;
}) {
  const {
    active,
    boardId,
    stageRef,
    layerRef,
    radius,
    clientId,
    addMyPath,
    removeMyPath,

    currentUserId,
  } = opts;
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
    addMyPath(id);

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
  }, [
    addMyPath,
    boardId,
    clientId,
    layerRef,
    publish,
    stageRef,
    radius,
    currentUserId,
  ]);

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
        if (dx * dx + dy * dy < 1) return prev;
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

    removeMyPath(pid);

    /*publish(`/app/board.${boardId}.op`, {
      type: "stroke.end",
      boardId,
      pathId: pid,
      clientId,
    });*/
  }, [boardId, publish, removeMyPath, clientId]);

  return {
    fogStrokes,
    setFogStrokes,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
