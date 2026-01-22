/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChannel } from "../../../ws/hooks";
import type { BoardOp } from "../ops";
import { type Drawable } from "../types";
import { useRef, useState } from "react";
import { apiObjectToDrawable } from "../utils/apiToDrawable";
import { handleStrokeStart } from "./usewsincomingfunctions/handleStrokeStart";
import { handleStrokeAppend } from "./usewsincomingfunctions/handleStrokeAppend";
import { handleTokenAdd } from "./usewsincomingfunctions/handleTokenAdd";
import { handleTransformApplied } from "./usewsincomingfunctions/handleTransformApplied";

type PushUndo = (
  a:
    | { kind: "draw"; objectId: string }
    | { kind: "erase"; objectIds: string[] },
) => void;
type ShouldIgnoreErase = (ids: string[]) => boolean;
type OnBoardCleared = () => void;

export function useWsIncoming(
  boardId: number,
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>,
  clientId: string,
  setActiveBoardId: React.Dispatch<React.SetStateAction<number | null>>,
  campaignId: string | undefined,
  opts?: {
    pushUndo?: PushUndo;
    shouldIgnoreEraseApplied?: ShouldIgnoreErase;
    OnBoardCleared?: OnBoardCleared;
  },
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
    >(),
  );
  const pendingRemotePointsRef = useRef<Map<string, number[][]>>(new Map());

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

    const isOwnLiveAppend =
      op.type === "stroke.append" &&
      (op as any).clientId === clientId &&
      "pathId" in op &&
      !!(op as any).pathId &&
      myActivePathsRef.current.has((op as any).pathId as string);
    if (isOwnLiveAppend) return;

    switch (op.type) {
      case "stroke.start": {
        handleStrokeStart({
          op,
          remoteStrokesRef,
          pendingRemotePointsRef,
          setObjects,
        });

        break;
      }

      case "stroke.append": {
        handleStrokeAppend({
          op,
          remoteStrokesRef,
          pendingRemotePointsRef,
          setObjects,
          pendingRemoval,
        });
        break;
      }
      case "stroke.end": {
        if (op.clientId === clientId && op.pathId && opts?.pushUndo) {
          opts.pushUndo({ kind: "draw", objectId: op.pathId });
        }
        console.log("stroke ended");
        break;
      }

      case "shape.add": {
        const s = op.shape;
        setObjects((prev) =>
          prev.some((o) => o.id === s.id) ? prev : [...prev, s],
        );
        if (op.clientId === clientId && s?.id && opts?.pushUndo) {
          opts.pushUndo({ kind: "draw", objectId: s.id });
        }
        break;
      }

      case "token.add": {
        handleTokenAdd({ op, setObjects });

        break;
      }

      case "token.deleted": {
        const t = (op as any).token ?? op;

        const idToRemove = String(t.id ?? t.objectId ?? "");
        if (!idToRemove) return;

        setObjects((prev) => prev.filter((o) => o.id !== idToRemove));

        break;
      }

      case "token.moved": {
        setObjects((prev) =>
          prev.map((o) =>
            o.type === "token" && o.id === op.id
              ? { ...o, col: op.col, row: op.row }
              : o,
          ),
        );
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

      case "erase.applied": {
        const removedIds = (op.removed ?? [])
          .map((r: any) => String(r.object?.objectId ?? ""))
          .filter(Boolean);

        setPendingRemoval((prev) => {
          const next = new Set(prev);
          removedIds.forEach((id) => next.delete(id));
          return next;
        });
        setObjects((prev) => prev.filter((s) => !removedIds.includes(s.id)));

        if (
          op.clientId === clientId &&
          removedIds.length &&
          !opts?.shouldIgnoreEraseApplied?.(removedIds) &&
          opts?.pushUndo
        ) {
          opts.pushUndo({ kind: "erase", objectIds: removedIds });
        }
        break;
      }

      case "erase.undo.applied": {
        const toAdd: Drawable[] = [];
        for (const r of op.restored ?? []) {
          const d = apiObjectToDrawable(r.object);
          if (d) toAdd.push(d);
        }
        if (toAdd.length) {
          setObjects((prev) => {
            const existing = new Set(prev.map((o) => o.id));
            const fresh = toAdd.filter((o) => !existing.has(o.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        }
        break;
      }

      case "board.cleared": {
        setObjects([]);
        setPendingRemoval(new Set());
        remoteStrokesRef.current.clear();
        myActivePathsRef.current.clear();
        opts?.OnBoardCleared?.();

        break;
      }
      case "transform.applied": {
        handleTransformApplied({ op, setObjects, clientId });

        break;
      }
    }
  });

  useChannel<{ type: "change-board"; boardId: number }>(
    `/topic/campaign.${campaignId}.op`,
    (op) => {
      if (!op || op.type !== "change-board") return;
      setActiveBoardId(Number(op.boardId));
      console.log("change-board from WS", op.boardId);
    },
  );

  return {
    addMyPath: (id: string) => myActivePathsRef.current.add(id),
    removeMyPath: (id: string) => myActivePathsRef.current.delete(id),
    markPendingRemoval,
    pendingRemoval,
  };
}
