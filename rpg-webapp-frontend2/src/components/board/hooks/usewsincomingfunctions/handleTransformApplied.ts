/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TransformAppliedOp } from "../../ops";
import { isEllipse, isRect, isStroke, type Drawable } from "../../types";

type TransformAppliedProps = {
  op: any;

  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
  clientId: string;
};

export function handleTransformApplied({
  op,
  setObjects,
  clientId,
}: TransformAppliedProps) {
  if ((op as any).clientId && (op as any).clientId === clientId) return;
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
    }),
  );
}
