import { Ellipse, Group, Line, Rect } from "react-konva";
import type { Drawable } from "../types";
import { useMemo } from "react";

type FogOfWarProps = {
  boardWidth: number;
  boardHeight: number;
  fogOfWarOn: boolean;
  objects: Drawable[];
};

export function FogOfWarLayer({
  boardWidth,
  boardHeight,
  fogOfWarOn,
  objects,
}: FogOfWarProps) {
  const fogOps = useMemo(
    () =>
      objects.filter(
        (o) =>
          o.type === "fog" ||
          o.type === "fogsquare" ||
          o.type === "fogcircle" ||
          o.type === "fogpencilstroke",
      ),
    [objects],
  );

  if (!fogOfWarOn) return null;

  return (
    <Group listening={false} perfectDrawEnabled={false}>
      <Rect
        x={0}
        y={0}
        width={boardWidth}
        height={boardHeight}
        fill="black"
        listening={false}
        perfectDrawEnabled={false}
      />

      {fogOps.map((o) => {
        switch (o.type) {
          case "fog":
            return (
              <Line
                key={o.id}
                points={o.points}
                stroke="black"
                strokeWidth={o.radius}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="destination-out"
                listening={false}
                perfectDrawEnabled={false}
              />
            );

          case "fogsquare":
            return (
              <Rect
                key={o.id}
                x={o.x + o.width / 2}
                y={o.y + o.height / 2}
                width={o.width}
                height={o.height}
                offsetX={o.width / 2}
                offsetY={o.height / 2}
                fill="black"
                globalCompositeOperation="destination-out"
                listening={false}
                perfectDrawEnabled={false}
              />
            );

          case "fogcircle":
            return (
              <Ellipse
                key={o.id}
                x={o.x + o.width / 2}
                y={o.y + o.height / 2}
                radiusX={o.width / 2}
                radiusY={o.height / 2}
                fill="black"
                globalCompositeOperation="destination-out"
                listening={false}
                perfectDrawEnabled={false}
              />
            );

          case "fogpencilstroke":
            return (
              <Line
                key={o.id}
                points={o.points}
                stroke="black"
                strokeWidth={o.strokeWidth}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="destination-over"
                listening={false}
                perfectDrawEnabled={false}
              />
            );

          default:
            return null;
        }
      })}
    </Group>
  );
}
