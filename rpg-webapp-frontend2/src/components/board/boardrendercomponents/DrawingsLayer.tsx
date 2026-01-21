import { memo } from "react";
import { Ellipse, Line, Rect } from "react-konva";
import type { Drawable } from "../types";
import type Konva from "konva";

type DrawingsLayerProps = {
  objects: Drawable[];
  selectableProps: (o: Drawable) => {
    name: string;
    ref: (node: Konva.Node | null) => void;
    id: string;
    onPointerDown:
      | ((e: Konva.KonvaEventObject<PointerEvent>) => void)
      | undefined;
    draggable: boolean;
    onDragStart: (() => void) | undefined;
    onDragEnd: (() => void) | undefined;
    onTransformStart: (() => void) | undefined;
    onTransformEnd: (() => void) | undefined;
  };
  isMine: (id: string) => boolean;
  erasePreview: Set<string>;
  pendingRemoval: Set<string>;
};

export const DrawingsLayer = memo(function DrawingsLayer({
  objects,
  selectableProps,
  isMine,
  erasePreview,
  pendingRemoval,
}: DrawingsLayerProps) {
  return (
    <>
      {objects
        .filter((o) => o.type !== "token")
        .map((o) => {
          if (o.type === "stroke") {
            return (
              <Line
                key={o.id}
                {...selectableProps(o)}
                points={o.points}
                stroke={o.color}
                strokeWidth={o.strokeWidth}
                lineCap="round"
                lineJoin="round"
                opacity={
                  (erasePreview.has(o.id) && isMine(o.id)) ||
                  pendingRemoval.has(o.id)
                    ? 0
                    : 1
                }
              />
            );
          }

          if (o.type === "rect") {
            const cx = o.x + o.width / 2;
            const cy = o.y + o.height / 2;
            return (
              <Rect
                key={o.id}
                {...selectableProps(o)}
                x={cx}
                y={cy}
                width={o.width}
                height={o.height}
                stroke={o.color}
                strokeWidth={o.strokeWidth}
                rotation={o.rotation ?? 0}
                offsetX={o.width / 2}
                offsetY={o.height / 2}
              />
            );
          }

          if (o.type === "ellipse") {
            const cx = o.x + o.width / 2;
            const cy = o.y + o.height / 2;
            return (
              <Ellipse
                key={o.id}
                {...selectableProps(o)}
                x={cx}
                y={cy}
                radiusX={o.width / 2}
                radiusY={o.height / 2}
                stroke={o.color}
                strokeWidth={o.strokeWidth}
                rotation={o.rotation ?? 0}
              />
            );
          }

          return null;
        })}
    </>
  );
});
