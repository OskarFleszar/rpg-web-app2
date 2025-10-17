/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChannel } from "../../../ws/hooks";
import type { BoardOp } from "../ops";
import type { Stroke } from "../types";
import { useRef, useState } from "react";

export function useWsIncoming(
  boardId: number,
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>,
  clientId: string
) {
  const myActivePathsRef = useRef<Set<string>>(new Set());
  const remoteStrokesRef = useRef(
    new Map<
      string,
      { last?: [number, number]; color: string; width: number; ownerId: string }
    >()
  );

  const [pendingRemoval, setPendingRemoval] = useState<Set<string>>(new Set());

  const markPendingRemoval = (ids: string[]) => {
    setPendingRemoval((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  useChannel<BoardOp>(`/topic/board.${boardId}.op`, (op) => {
    if (!op || typeof (op as any).type !== "string") return;

    const isOwnActivePath =
      (op as any).clientId === clientId &&
      "pathId" in op &&
      !!(op as any).pathId &&
      myActivePathsRef.current.has((op as any).pathId as string);
    if (isOwnActivePath) return;

    if ("pathId" in op && op.pathId && pendingRemoval.has(op.pathId)) {
      return;
    }

    switch (op.type) {
      case "stroke.start": {
        remoteStrokesRef.current.set(op.pathId, {
          color: op.color,
          width: op.width,
          ownerId: String(op.ownerId ?? ""),
          last: undefined,
        });
        break;
      }
      case "stroke.append": {
        if (pendingRemoval.has(op.pathId)) return;

        const state = remoteStrokesRef.current.get(op.pathId)!;

        setStrokes((prev) => {
          const idx = prev.findIndex((st) => st.id === op.pathId);
          if (idx === -1) {
            const flat = (op.points ?? []).flat();
            return [
              ...prev,
              {
                id: op.pathId,
                color: state.color,
                width: state.width,
                points: flat,
                ownerId: state.ownerId,
              },
            ];
          } else {
            const add = (op.points ?? []).flat();
            if (!add.length) return prev;
            const updated = {
              ...prev[idx],
              points: [...prev[idx].points, ...add],
            };
            const copy = prev.slice();
            copy[idx] = updated;
            return copy;
          }
        });

        const lastPts = op.points ?? [];
        if (lastPts.length) {
          const last = lastPts[lastPts.length - 1]!;
          state.last = [last[0], last[1]];
        }
        break;
      }
      case "stroke.end": {
        if ((op as any).clientId === clientId && op.pathId) {
          myActivePathsRef.current.delete(op.pathId);
        }
        remoteStrokesRef.current.delete(op.pathId);
        break;
      }

      case "object.remove": {
        setPendingRemoval((prev) => {
          const next = new Set(prev);
          next.delete(op.objectId);
          return next;
        });
        setStrokes((prev) => prev.filter((s) => s.id !== op.objectId));
        break;
      }
      case "objects.removed": {
        const removed = new Set((op.objectIds ?? []).map(String));
        setPendingRemoval((prev) => {
          const next = new Set(prev);
          removed.forEach((id) => next.delete(id));
          return next;
        });
        setStrokes((prev) => prev.filter((s) => !removed.has(s.id)));
        break;
      }
    }
  });

  return {
    addMyPath: (id: string) => myActivePathsRef.current.add(id),
    removeMyPath: (id: string) => myActivePathsRef.current.delete(id),
    markPendingRemoval,
    pendingRemoval,
  };
}
