import { useCallback, useRef } from "react";
import { usePublish } from "../../../ws/hooks";
import type Konva from "konva";
import type { StrokeAppendOp, StrokeStartOp } from "../ops";
import { isStroke, type Drawable } from "../types";
import { getPointerOnLayer } from "../utils/konvaCoords";

export function fallbackUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function usePencil(opts: {
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  color: string;
  strokeWidth: number;
  clientId: string;
  addMyPath: (id: string) => void;
  removeMyPath: (id: string) => void;
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
  currentUserId: string;
}) {
  const {
    boardId,
    stageRef,
    layerRef,
    color,
    strokeWidth,
    clientId,
    addMyPath,
    removeMyPath,
    setObjects,
    currentUserId,
  } = opts;
  const publish = usePublish();

  const pendingPointsRef = useRef<number[][]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const pathIdRef = useRef<string | null>(null);

  const flushAppend = useCallback(() => {
    const pts = pendingPointsRef.current;
    if (!pts.length || !pathIdRef.current) return;
    const op: StrokeAppendOp = {
      type: "stroke.append",
      boardId,
      pathId: pathIdRef.current,
      points: pts.splice(0, pts.length),
      clientId,
    };
    publish(`/app/board.${boardId}.op`, op);
  }, [boardId, clientId, publish]);

  const ensureFlushTimer = useCallback(() => {
    if (flushTimerRef.current != null) return;
    flushTimerRef.current = window.setInterval(
      flushAppend,
      40
    ) as unknown as number;
  }, [flushAppend]);

  const clearFlushTimer = useCallback(() => {
    if (flushTimerRef.current != null) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(() => {
    pendingPointsRef.current.length = 0;
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (!pt) return;

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : fallbackUUID();
    pathIdRef.current = id;
    addMyPath(id);

    const opStart: StrokeStartOp = {
      type: "stroke.start",
      boardId,
      layerId: "base",
      pathId: id,
      color,
      width: strokeWidth,
      clientId,
      ownerId: currentUserId,
    };
    publish(`/app/board.${boardId}.op`, opStart);

    pendingPointsRef.current.push([pt.x, pt.y]);
    ensureFlushTimer();

    setObjects((prev) => [
      ...prev,
      {
        type: "stroke",
        id,
        points: [pt.x, pt.y],
        color,
        strokeWidth,
        ownerId: currentUserId,
      },
    ]);
  }, [
    addMyPath,
    boardId,
    clientId,
    color,
    ensureFlushTimer,
    layerRef,
    publish,
    setObjects,
    stageRef,
    strokeWidth,
    currentUserId,
  ]);

  const onPointerMove = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    const pid = pathIdRef.current;
    if (!pt || !pid) return;

    setObjects((prev) => {
      const idx = prev.findIndex((o) => isStroke(o) && o.id === pid);
      if (idx === -1) return prev;

      const stroke = prev[idx];
      if (!isStroke(stroke)) return prev;

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
  }, [layerRef, setObjects, stageRef]);

  const onPointerUp = useCallback(() => {
    const pid = pathIdRef.current;
    pathIdRef.current = null;
    if (!pid) return;

    flushAppend();
    clearFlushTimer();
    removeMyPath(pid);

    publish(`/app/board.${boardId}.op`, {
      type: "stroke.end",
      boardId,
      pathId: pid,
      clientId,
    });
  }, [boardId, clearFlushTimer, flushAppend, publish, removeMyPath, clientId]);

  return { onPointerDown, onPointerMove, onPointerUp };
}
