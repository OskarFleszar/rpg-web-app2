/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import type Konva from "konva";
import { getPointerOnLayer } from "../utils/konvaCoords";
import type { Tool } from "../types";

type Point = { x: number; y: number };

type Args = {
  tool: Tool;

  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;

  isInsideBoard: (pt: Point) => boolean;

  pencil: {
    onPointerDown: () => void;
    onPointerMove: () => void;
    onPointerUp: () => void;
  };
  shapes: {
    onPointerDown: () => void;
    onPointerMove: () => void;
    onPointerUp: () => void;
  };
  token: { onPointerDown: () => void };

  pointer: { onStagePointerDown: (e: any) => void };

  eraser: { onDown: () => void; onMove: () => void; onUp: () => void };
};

export function useToolHandlers({
  tool,
  stageRef,
  layerRef,
  isInsideBoard,
  pencil,
  shapes,
  token,
  pointer,
  eraser,
}: Args) {
  const [pointerOnLayer, setPointerOnLayer] = useState<Point | null>(null);

  const updatePointer = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (pt && isInsideBoard(pt)) setPointerOnLayer(pt);
    else setPointerOnLayer(null);
  }, [stageRef, layerRef, isInsideBoard]);

  const onPointerDown = useCallback(
    (e: any) => {
      const pt = getPointerOnLayer(stageRef, layerRef);
      if (!pt || !isInsideBoard(pt)) return;

      if (tool === "pencil") return pencil.onPointerDown();
      if (tool === "eraser") return eraser.onDown();
      if (tool === "rect" || tool === "ellipse") return shapes.onPointerDown();
      if (tool === "pointer") return pointer.onStagePointerDown(e);
      if (tool === "token") return token.onPointerDown();
    },
    [
      tool,
      stageRef,
      layerRef,
      isInsideBoard,
      pencil,
      eraser,
      shapes,
      pointer,
      token,
    ],
  );

  const onPointerMove = useCallback(() => {
    const pt = getPointerOnLayer(stageRef, layerRef);

    const needsCursor =
      tool === "eraser" ||
      tool === "pencil" ||
      tool === "rect" ||
      tool === "ellipse";
    if (needsCursor) updatePointer();
    if (!pt || !isInsideBoard(pt)) return;

    if (tool === "pencil") return pencil.onPointerMove();
    if (tool === "eraser") return eraser.onMove();
    if (tool === "rect" || tool === "ellipse") return shapes.onPointerMove();
  }, [
    tool,
    stageRef,
    layerRef,
    isInsideBoard,
    updatePointer,
    pencil,
    eraser,
    shapes,
  ]);

  const onPointerUp = useCallback(() => {
    setPointerOnLayer(null);

    if (tool === "pencil") return pencil.onPointerUp();
    if (tool === "eraser") return eraser.onUp();
    if (tool === "rect" || tool === "ellipse") return shapes.onPointerUp();
  }, [tool, pencil, eraser, shapes]);

  return { onPointerDown, onPointerMove, onPointerUp, pointerOnLayer };
}
