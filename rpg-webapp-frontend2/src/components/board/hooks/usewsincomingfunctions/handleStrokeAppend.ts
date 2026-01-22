/* eslint-disable @typescript-eslint/no-explicit-any */
import { isStroke, type Drawable, type Stroke } from "../../types";

type StrokeAppendProps = {
  op: any;
  remoteStrokesRef: React.RefObject<
    Map<
      string,
      {
        last?: [number, number];
        color: string;
        strokeWidth: number;
        ownerId: string;
      }
    >
  >;
  pendingRemotePointsRef: React.RefObject<Map<string, number[][]>>;
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
  pendingRemoval: Set<string>;
};

export function handleStrokeAppend({
  op,
  remoteStrokesRef,
  pendingRemotePointsRef,
  setObjects,
  pendingRemoval,
}: StrokeAppendProps) {
  if (pendingRemoval.has(op.pathId)) return;

  const state = remoteStrokesRef.current.get(op.pathId);
  const add = (op.points ?? []).flat();
  if (!add.length) return;

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
        state!.strokeWidth,
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
}
