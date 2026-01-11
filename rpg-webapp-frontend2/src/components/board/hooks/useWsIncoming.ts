/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChannel } from "../../../ws/hooks";
import type { BoardOp, TransformAppliedOp } from "../ops";
import {
  isEllipse,
  isRect,
  isStroke,
  type Drawable,
  type Stroke,
} from "../types";
import { useRef, useState } from "react";
import { apiObjectToDrawable } from "../utils/apiToDrawable";

type PushUndo = (
  a: { kind: "draw"; objectId: string } | { kind: "erase"; objectIds: string[] }
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
  }
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
        remoteStrokesRef.current.set(op.pathId, {
          color: op.color,
          strokeWidth: op.width,
          ownerId: String(op.ownerId ?? ""),
          last: undefined,
        });
        console.log("stroke start: ", "color:", op.color, "width:", op.width);

        const buffered = pendingRemotePointsRef.current.get(op.pathId);
        if (buffered && buffered.length) {
          pendingRemotePointsRef.current.delete(op.pathId);
          const add = buffered.flat();

          setObjects((prev) => {
            const idx = prev.findIndex((o) => o.id === op.pathId);
            if (idx === -1) {
              const newStroke: Stroke = {
                type: "stroke",
                id: op.pathId,
                color: op.color,
                strokeWidth: op.width,
                points: add,
                ownerId: String(op.ownerId ?? ""),
              };
              return [...prev, newStroke];
            }
            const existing = prev[idx];
            if (!isStroke(existing)) return prev;
            const updated: Stroke = {
              ...existing,
              points: [...existing.points, ...add],
            };
            const copy = prev.slice();
            copy[idx] = updated;
            return copy;
          });
        }

        break;
      }

      case "stroke.append": {
        if (pendingRemoval.has(op.pathId)) return;

        let state = remoteStrokesRef.current.get(op.pathId);
        const add = (op.points ?? []).flat();
        if (!add.length) break;

        if (!state) {
          const buf = pendingRemotePointsRef.current.get(op.pathId) ?? [];
          buf.push(...(op.points ?? []));
          pendingRemotePointsRef.current.set(op.pathId, buf);
          return;
        }

        setObjects((prev) => {
          const idx = prev.findIndex((o) => o.id === op.pathId);
          if (idx === -1) {
            const newStroke: Stroke = {
              type: "stroke",
              id: op.pathId,
              color: state!.color,
              strokeWidth: state!.strokeWidth,
              points: add,
              ownerId: state!.ownerId,
            };
            console.log(
              "stroke append: ",
              "color:",
              state!.color,
              "width:",
              state!.strokeWidth
            );
            return [...prev, newStroke];
          }
          const existing = prev[idx];
          if (!isStroke(existing)) return prev;
          const updated: Stroke = {
            ...existing,
            points: [...existing.points, ...add],
          };
          const copy = prev.slice();
          copy[idx] = updated;
          return copy;
        });

        const lastPts = op.points ?? [];
        if (lastPts.length) {
          const last = lastPts[lastPts.length - 1]!;
          state.last = [last[0], last[1]];
        }
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
          prev.some((o) => o.id === s.id) ? prev : [...prev, s]
        );
        if (op.clientId === clientId && s?.id && opts?.pushUndo) {
          opts.pushUndo({ kind: "draw", objectId: s.id });
        }
        break;
      }

      case "token.add": {
        const t = (op as any).token ?? op;

        const id = String(t.id ?? t.objectId ?? "");
        if (!id) return;

        const col = Number(t.col);
        const row = Number(t.row);
        if (!Number.isFinite(col) || !Number.isFinite(row)) return;

        setObjects((prev) => {
          if (prev.some((o) => o.id === id)) return prev;

          return [
            ...prev,
            {
              type: "token" as const,
              id,
              col,
              row,
              characterId: Number(t.characterId),
              ownerId: String(
                t.ownerId ?? (op as any).ownerId ?? (op as any).userId ?? ""
              ),
            },
          ];
        });

        break;
      }

      case "token.moved": {
        setObjects((prev) =>
          prev.map((o) =>
            o.type === "token" && o.id === op.id
              ? { ...o, col: op.col, row: op.row }
              : o
          )
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
        if ((op as any).clientId && (op as any).clientId === clientId) break;
        const changed = (op as TransformAppliedOp).changed ?? [];

        const byId = new Map(changed.map((ch) => [String(ch.id), ch]));

        setObjects((prev) =>
          prev.map((o) => {
            const ch = byId.get(o.id);
            if (!ch) return o;

            if (ch.kind === "stroke" && isStroke(o)) {
              return { ...o, points: ch.points };
            }

            if (
              (ch.kind === "rect" || ch.kind === "ellipse") &&
              (isRect(o) || isEllipse(o))
            ) {
              return {
                ...o,
                x: ch.x,
                y: ch.y,
                width: ch.width,
                height: ch.height,
                rotation: ch.rotation ?? 0,
              };
            }

            return o;
          })
        );

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
    }
  );

  return {
    addMyPath: (id: string) => myActivePathsRef.current.add(id),
    removeMyPath: (id: string) => myActivePathsRef.current.delete(id),
    markPendingRemoval,
    pendingRemoval,
  };
}
