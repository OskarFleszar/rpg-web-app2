import type Konva from "konva";
import type { Drawable } from "../types";
import { usePublish } from "../../../ws/hooks";
import { useCallback, useRef } from "react";
import { getPointerOnLayer } from "../utils/konvaCoords";

type Kind = "rect" | "ellipse";

export function useShape(opts: {
  kind: Kind;
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  color: string;
  strokeWidth: number;
  clientId: string;
  currentUserId: string;
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
}) {
  const {
    kind,
    boardId,
    stageRef,
    layerRef,
    color,
    strokeWidth,
    clientId,
    currentUserId,
    setObjects,
  } = opts;
  const publish = usePublish();
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const tempIdRef = useRef<string | null>(null);

  function boxFrom(a: { x: number; y: number }, b: { x: number; y: number }) {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const w = Math.abs(a.x - b.x);
    const h = Math.abs(a.y - b.y);
    return { x, y, width: w, height: h };
  }

  const onPointerDown = useCallback(() => {
    const p = getPointerOnLayer(stageRef, layerRef);
    if (!p) return;
    startRef.current = { x: p.x, y: p.y };
    const id = crypto?.randomUUID?.() ?? `${Date.now()} - ${Math.random()}`;
    tempIdRef.current = id;

    const { x, y, width, height } = boxFrom(p, p);

    setObjects((prev) => [
      ...prev,
      kind === "rect"
        ? {
            type: "rect",
            id,
            x,
            y,
            width,
            height,
            color,
            strokeWidth,
            ownerId: currentUserId,
          }
        : {
            type: "ellipse",
            id,
            x,
            y,
            width,
            height,
            color,
            strokeWidth,
            ownerId: currentUserId,
          },
    ]);
  }, [color, currentUserId, kind, layerRef, setObjects, stageRef, strokeWidth]);

  const onPointerMove = useCallback(() => {
    if (!startRef.current || !tempIdRef.current) return;
    const p = getPointerOnLayer(stageRef, layerRef);
    if (!p) return;

    const box = boxFrom(startRef.current, p);

    setObjects((prev) =>
      prev.map((o) => {
        if (o.id !== tempIdRef.current) return o;
        if (o.type === "rect") return { ...o, ...box };
        if (o.type === "ellipse") return { ...o, ...box };
        return o;
      })
    );
  }, [layerRef, stageRef, setObjects]);

  const onPointerUp = useCallback(() => {
    if (!startRef.current || !tempIdRef.current) return;
    const id = tempIdRef.current;
    tempIdRef.current = null;

    setObjects((prev) => {
      const obj = prev.find((o) => o.id === id);
      if (!obj) return prev;

      const toSend = {
        type: "shape.add",
        boardId,
        layerId: "base",
        clientId,
        shape: obj,
      };
      console.log("[shape.add SEND]", obj);

      publish(`/app/board.${boardId}.op`, toSend);

      return prev;
    });
    startRef.current = null;
  }, [boardId, clientId, publish, setObjects]);

  return { onPointerDown, onPointerUp, onPointerMove };
}
