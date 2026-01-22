/* eslint-disable @typescript-eslint/no-explicit-any */

import { isStroke, type Drawable, type Stroke } from "../../types";

type StrokeStartProps = {
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
};

export function handleStrokeStart({
  op,
  remoteStrokesRef,
  pendingRemotePointsRef,
  setObjects,
}: StrokeStartProps) {
  remoteStrokesRef.current.set(op.pathId, {
    color: op.color,
    strokeWidth: op.width,
    ownerId: String(op.ownerId ?? ""),
    last: undefined,
  });

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
}
