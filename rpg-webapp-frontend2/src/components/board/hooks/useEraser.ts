import { useCallback, useRef } from "react";
import { usePublish } from "../../../ws/hooks";
import type Konva from "konva";
import { getPointerOnLayer } from "../utils/konvaCoords";

export function useEraser(opts: {
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  radius: number;
  clientId: string;
}) {
  const { boardId, stageRef, layerRef, radius, clientId } = opts;
  const publish = usePublish();

  const eraseIdRef = useRef<string | null>(null);
  const pendingRef = useRef<number[][]>([]);
  const timerRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    const pts = pendingRef.current;
    if (!pts.length || !eraseIdRef.current) return;
    publish(`/app/board.${boardId}.op`, {
      type: "erase.append",
      boardId,
      eraseId: eraseIdRef.current,
      points: pts.splice(0, pts.length),
      clientId,
    });
  }, [boardId, clientId, publish]);

  const ensureTimer = useCallback(() => {
    if (timerRef.current != null) return;
    timerRef.current = window.setInterval(flush, 40) as unknown as number;
  }, [flush]);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerDown = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (!pt) return;
    const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    eraseIdRef.current = id;

    publish(`/app/board.${boardId}.op`, {
      type: "erase.start",
      boardId,
      layerId: "base",
      eraseId: id,
      radius,
      clientId,
    });

    pendingRef.current.push([pt.x, pt.y]);
    ensureTimer();
  }, [boardId, clientId, ensureTimer, layerRef, publish, radius, stageRef]);

  const onPointerMove = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (!pt || !eraseIdRef.current) return;
    pendingRef.current.push([pt.x, pt.y]);
  }, [layerRef, stageRef]);

  const onPointerUp = useCallback(() => {
    const id = eraseIdRef.current;
    if (!id) return;
    flush();
    clearTimer();
    eraseIdRef.current = null;

    publish(`/app/board.${boardId}.op`, {
      type: "erase.end",
      boardId,
      eraseId: id,
      clientId,
    });
  }, [boardId, clearTimer, flush, publish]);

  return { onPointerDown, onPointerMove, onPointerUp };
}
