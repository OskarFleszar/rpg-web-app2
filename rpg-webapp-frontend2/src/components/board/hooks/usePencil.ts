import { useCallback, useRef } from "react";
import { usePublish } from "../../../ws/hooks";
import type Konva from "konva";
import type { StrokeAppendOp, StrokeStartOp } from "../ops";
import { isStroke, type Drawable } from "../types";
import { getPointerOnLayer } from "../utils/konvaCoords";

export function usePencil(opts: {
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  color: string;
  width: number;
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
    width,
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

    const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    pathIdRef.current = id;
    addMyPath(id);

    const opStart: StrokeStartOp = {
      type: "stroke.start",
      boardId,
      layerId: "base",
      pathId: id,
      color,
      width,
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
        width,
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
    width,
    currentUserId,
  ]);

  const onPointerMove = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (!pt || !pathIdRef.current) return;

    setObjects((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (!isStroke(last)) return prev;
      const L = last.points.length;
      if (L >= 2) {
        const dx = pt.x - last.points[L - 2];
        const dy = pt.y - last.points[L - 1];
        if (dx * dx + dy * dy < 1) return prev;
      }
      pendingPointsRef.current.push([pt.x, pt.y]);
      const updated = { ...last, points: [...last.points, pt.x, pt.y] };
      return [...prev.slice(0, -1), updated];
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
