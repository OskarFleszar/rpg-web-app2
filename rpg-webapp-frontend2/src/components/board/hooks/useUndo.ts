import { useCallback, useEffect } from "react";
import { usePublish } from "../../../ws/hooks";
import type { Drawable, Stroke } from "../types";

type Args = {
  boardId: number;
  clientId: string;
  currentUserId: string;
  objects: Drawable[];
  markPendingRemoval: (ids: string[]) => void;
};
export function useUndo({
  boardId,
  clientId,
  currentUserId,
  objects,
  markPendingRemoval,
}: Args) {
  const publish = usePublish();

  const undoLastStroke = useCallback(() => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const s = objects[i];
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
  }, [boardId, clientId, objects, currentUserId, markPendingRemoval, publish]);

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
