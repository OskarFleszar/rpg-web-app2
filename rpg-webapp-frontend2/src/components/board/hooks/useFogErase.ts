import { useCallback, useRef } from "react";
import { usePublish } from "../../../ws/hooks";
import type Konva from "konva";

import { getPointerOnLayer } from "../utils/konvaCoords";
import { fallbackUUID } from "./usePencil";
import { isFog, type Drawable } from "../types";

type FogEraseChunkOp = {
  type: "fog.line.erased";
  boardId: number;
  campaignId: string;
  pathId: string;
  radius: number;
  chunkIndex: number;
  isLast: boolean;
  points: number[];
  clientId: string;
  layerId: string;
};

const CHUNK_POINTS = 200;

export function useFogErase(opts: {
  active: boolean;
  campaignId: string;
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  radius: number;
  clientId: string;
  currentUserId: string;
  layerId: string;
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
}) {
  const {
    currentUserId,
    active,
    campaignId,
    boardId,
    stageRef,
    layerRef,
    radius,
    clientId,
    layerId,
    setObjects,
  } = opts;
  const publish = usePublish();

  const packPoints = (pts: number[][]) => {
    const out: number[] = [];
    for (const [x, y] of pts) {
      out.push(Math.round(x), Math.round(y));
    }
    return out;
  };

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

    pendingPointsRef.current.push([pt.x, pt.y]);

    setObjects((prev) => [
      ...prev,
      {
        type: "fog",
        id,
        points: [pt.x, pt.y],
        radius,
        ownerId: currentUserId,
      },
    ]);
  }, [active, stageRef, layerRef, setObjects, radius, currentUserId]);

  const onPointerMove = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    const pid = pathIdRef.current;
    if (!pt || !pid) return;

    setObjects((prev) => {
      const idx = prev.findIndex((o) => isFog(o) && o.id === pid);

      if (idx === -1) return prev;

      const stroke = prev[idx];
      if (!isFog(stroke)) return prev;

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
  }, [layerRef, radius, setObjects, stageRef]);

  const onPointerUp = useCallback(() => {
    const pid = pathIdRef.current;
    pathIdRef.current = null;
    if (!pid) return;

    const pts = pendingPointsRef.current;
    pendingPointsRef.current = [];

    if (!pts.length) return;

    const packed = packPoints(pts);

    const numsPerChunk = CHUNK_POINTS * 2;

    let chunkIndex = 0;
    for (let i = 0; i < packed.length; i += numsPerChunk) {
      const slice = packed.slice(i, i + numsPerChunk);
      const isLast = i + numsPerChunk >= packed.length;

      const op: FogEraseChunkOp = {
        type: "fog.line.erased",
        boardId,
        campaignId,
        pathId: pid,
        radius,
        chunkIndex,
        isLast,
        points: slice,
        clientId,
        layerId,
      };

      publish(`/app/board.${boardId}.op`, op);
      chunkIndex++;
    }
  }, [boardId, campaignId, radius, clientId, layerId, publish]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
