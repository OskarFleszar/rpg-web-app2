// useUndo.ts
import { useCallback, useEffect, useRef } from "react";
import { usePublish } from "../../../ws/hooks";
import type { Drawable } from "../types";

type UndoAction =
  | { kind: "draw"; objectId: string }
  | { kind: "erase"; objectIds: string[] };

type Args = {
  boardId: number;
  clientId: string;
  objects: Drawable[];
  markPendingRemoval?: (ids: string[]) => void;
  isGM: boolean;
};

export function useUndo({ boardId, clientId, markPendingRemoval, isGM }: Args) {
  const publish = usePublish();
  const undoStackRef = useRef<UndoAction[]>([]);

  const ignoreNextEraseForIdsRef = useRef<Set<string>>(new Set());

  const pushUndo = useCallback((a: UndoAction) => {
    undoStackRef.current.push(a);
  }, []);

  const shouldIgnoreEraseApplied = useCallback((ids: string[]) => {
    if (!ids.length) return false;
    const S = ignoreNextEraseForIdsRef.current;
    const all = ids.every((id) => S.has(id));
    if (all) {
      ids.forEach((id) => S.delete(id));
      return true;
    }
    return false;
  }, []);

  const undo = useCallback(() => {
    const last = undoStackRef.current.pop();
    if (!last) return;

    if (last.kind === "draw") {
      ignoreNextEraseForIdsRef.current.add(last.objectId);

      markPendingRemoval?.([last.objectId]);
      publish(`/app/board.${boardId}.op`, {
        type: "erase.commit",
        boardId,
        objectIds: [last.objectId],
        clientId,
        isGM,
      } as const);
      return;
    }

    if (last.kind === "erase") {
      publish(`/app/board.${boardId}.op`, {
        type: "erase.undo",
        boardId,
        objectIds: last.objectIds,
        clientId,
        isGM,
      } as const);
      return;
    }
  }, [boardId, clientId, markPendingRemoval, publish]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isUndo =
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        (e.key === "z" || e.key === "Z");
      if (!isUndo) return;
      e.preventDefault();
      undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo]);

  return { undo, pushUndo, shouldIgnoreEraseApplied };
}
