import { useCallback, useEffect } from "react";
import { usePublish } from "../../../ws/hooks";
import type { Stroke } from "../types";

type Args = {
  boardId: number;
  clientId: string;
  currentUserId: string;
  strokes: Stroke[];
  markPendingRemoval: (ids: string[]) => void;
};
export function useUndo({
  boardId,
  clientId,
  currentUserId,
  strokes,
  markPendingRemoval,
}: Args) {
  const publish = usePublish();

  const undoLastStroke = useCallback(() => {
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      if (s.ownerId === currentUserId) {
        const lastStrokeId = [s.id];

        markPendingRemoval(lastStrokeId);

        publish(`/app/board.${boardId}.op`, {
          type: "erase.commit",
          boardId,
          objectIds: lastStrokeId,
          clientId,
        } as const);

        break;
      }
    }
  }, [boardId, clientId, strokes, currentUserId, markPendingRemoval, publish]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isUndo =
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        (e.key === "z" || e.key === "Z");
      if (!isUndo) return;

      e.preventDefault();
      undoLastStroke();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}
