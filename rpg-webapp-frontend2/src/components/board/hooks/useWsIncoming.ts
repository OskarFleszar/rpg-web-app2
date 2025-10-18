/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChannel } from "../../../ws/hooks";
import type { BoardOp } from "../ops";
import { isStroke, type Drawable, type Stroke } from "../types";
import { useRef, useState } from "react";

export function useWsIncoming(
  boardId: number,
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>,
  clientId: string
) {
  const myActivePathsRef = useRef<Set<string>>(new Set());
  const remoteStrokesRef = useRef(
    new Map<
      string,
      {
        last?: [number, number];
        color: string;
        strokeWidth: number;
        ownerId: string;
      }
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
          strokeWidth: op.width,
          ownerId: String(op.ownerId ?? ""),
          last: undefined,
        });
        break;
      }
      case "stroke.append": {
        if (pendingRemoval.has(op.pathId)) return;

        // 1) pobierz / zainicjalizuj stan:
        let state = remoteStrokesRef.current.get(op.pathId);
        if (!state) {
          // append dotarł przed startem – zasiej bezpieczne domyślne wartości
          state = {
            color: "#000",
            strokeWidth: 2,
            ownerId: "",
            last: undefined,
          };
          remoteStrokesRef.current.set(op.pathId, state);
        }

        // 2) punkty do dopięcia
        const add = (op.points ?? []).flat();
        if (!add.length) break;

        // 3) aktualizacja store'u obiektów
        setObjects((prev) => {
          const idx = prev.findIndex((o) => o.id === op.pathId);
          if (idx === -1) {
            const newStroke: Stroke = {
              type: "stroke",
              id: op.pathId,
              color: state.color,
              strokeWidth: state.strokeWidth,
              points: add,
              ownerId: state.ownerId,
            };
            return [...prev, newStroke];
          }

          const existing = prev[idx];
          if (!isStroke(existing)) return prev; // zabezpieczenie

          const updated: Stroke = {
            ...existing,
            points: [...existing.points, ...add],
          };
          const copy = prev.slice();
          copy[idx] = updated;
          return copy;
        });

        // 4) aktualizacja ostatniego punktu w stanie pomocniczym
        const lastPts = op.points ?? [];
        if (lastPts.length) {
          const last = lastPts[lastPts.length - 1]!;
          state.last = [last[0], last[1]];
        }
        break;
      }

      case "object.remove": {
        setPendingRemoval((prev) => {
          const next = new Set(prev);
          next.delete(op.objectId);
          return next;
        });
        setObjects((prev) => prev.filter((s) => s.id !== op.objectId));
        break;
      }
      case "objects.removed": {
        const removed = new Set((op.objectIds ?? []).map(String));
        setPendingRemoval((prev) => {
          const next = new Set(prev);
          removed.forEach((id) => next.delete(id));
          return next;
        });
        setObjects((prev) => prev.filter((s) => !removed.has(s.id)));
        break;
      }
      case "shape.add": {
        const s = op.shape;
        setObjects((prev) =>
          prev.some((o) => o.id === s.id) ? prev : [...prev, s]
        );
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
