import { useChannel } from "../../../ws/hooks";
import type { BoardOp } from "../ops";
import type { Stroke } from "../types";
import { useRef } from "react";

export function useWsIncoming(
  boardId: number,
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>,
  clientId: string
) {
  const myActivePathsRef = useRef<Set<string>>(new Set());

  const addMyPath = (id: string) => myActivePathsRef.current.add(id);
  const removeMyPath = (id: string) => myActivePathsRef.current.delete(id);

  const remoteStrokesRef = useRef<
    Map<string, { last?: [number, number]; color: string; width: number }>
  >(new Map());

  useChannel<BoardOp>(`/topic/board.${boardId}.op`, (op) => {
    if (!op || typeof (op as any).type !== "string") return;

    if ((op as any).clientId === clientId) {
      if (
        "pathId" in op &&
        op.pathId &&
        myActivePathsRef.current.has(op.pathId)
      )
        return;
    }

    switch (op.type) {
      case "stroke.start": {
        remoteStrokesRef.current.set(op.pathId, {
          color: op.color,
          width: op.width,
          last: undefined,
        });
        break;
      }
      case "stroke.append": {
        const s = remoteStrokesRef.current.get(op.pathId);
        if (!s) {
          remoteStrokesRef.current.set(op.pathId, {
            color: "#000",
            width: 2,
            last: undefined,
          });
        }
        const state = remoteStrokesRef.current.get(op.pathId)!;

        setStrokes((prev) => {
          const idx = prev.findIndex((st) => st.id === op.pathId);
          if (idx === -1) {
            const firstPts = op.points ?? [];
            const flat = firstPts.flat();
            const newStroke: Stroke = {
              id: op.pathId,
              color: state.color,
              width: state.width,
              points: flat,
            };
            return [...prev, newStroke];
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
        remoteStrokesRef.current.delete(op.pathId);
        break;
      }
      default:
        break;
    }
  });

  return { addMyPath, removeMyPath };
}
