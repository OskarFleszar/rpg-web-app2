import type Konva from "konva";
import type { Drawable } from "../types";
import { usePublish } from "../../../ws/hooks";
import { useCallback } from "react";
import { getPointerOnLayer } from "../utils/konvaCoords";

export function useToken(opts: {
  active: boolean;
  boardId: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  layerRef: React.RefObject<Konva.Layer | null>;
  clientId: string;
  currentUserId: string;
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
  boardMeta: { cols: number; rows: number; cellSize: number };
  layerId?: string;
  characterId: number | null;
}) {
  const {
    active,
    boardId,
    stageRef,
    layerRef,
    clientId,
    currentUserId,
    setObjects,
    boardMeta,
    layerId,
    characterId,
  } = opts;

  const { cols, rows, cellSize } = boardMeta;

  const publish = usePublish();

  const onPointerDown = useCallback(() => {
    if (!active) return;
    if (characterId == null) return;

    const p = getPointerOnLayer(stageRef, layerRef);
    if (!p) return;

    const boardWidth = cols * cellSize;
    const boardHeight = rows * cellSize;

    if (p.x < 0 || p.y < 0 || p.x >= boardWidth || p.y >= boardHeight) return;

    const col = Math.max(0, Math.min(cols - 1, Math.floor(p.x / cellSize)));
    const row = Math.max(0, Math.min(rows - 1, Math.floor(p.y / cellSize)));

    const id = crypto.randomUUID();

    setObjects((prev) => [
      ...prev,
      {
        type: "token",
        id,
        col,
        row,
        ownerId: currentUserId,
        characterId: characterId,
      } as const,
    ]);

    publish(`/app/board.${boardId}.op`, {
      type: "token.add",
      boardId,
      clientId,
      layerId: layerId ?? "tokens",
      token: {
        id,
        characterId,
        col,
        row,
        layerId: layerId ?? "tokens",
      },
    });
  }, [
    active,
    stageRef,
    layerRef,
    cols,
    rows,
    cellSize,
    setObjects,
    currentUserId,
    publish,
    boardId,
    clientId,
    layerId,
    characterId,
  ]);

  return { onPointerDown };
}
