import { Ellipse, Group, Line, Rect } from "react-konva";
import type { Drawable, FogCircle, FogSquare, FogStroke } from "../types";
import { useEffect, useState } from "react";

type FogOfWarProps = {
  boardWidth: number;
  boardHeight: number;
  fogOfWarOn: boolean;
  isGM: boolean;
  objects: Drawable[];
};

export function FogOfWarLayer({
  boardWidth,
  boardHeight,
  fogOfWarOn,
  isGM,
  objects,
}: FogOfWarProps) {
  const [fogStrokes, setFogStrokes] = useState<FogStroke[]>([]);
  const [fogSquares, setFogSquares] = useState<FogSquare[]>([]);
  const [fogCircles, setFogCircles] = useState<FogCircle[]>([]);

  useEffect(() => {
    setFogStrokes(objects.filter((o): o is FogStroke => o.type === "fog"));
    setFogSquares(
      objects.filter((o): o is FogSquare => o.type === "fogsquare"),
    );
    setFogCircles(
      objects.filter((o): o is FogCircle => o.type === "fogcircle"),
    );
  }, [objects]);

  if (!fogOfWarOn) return null;

  return (
    <Group listening={false}>
      <Rect
        x={0}
        y={0}
        width={boardWidth}
        height={boardHeight}
        fill="black"
        opacity={isGM ? 0.7 : 1}
        listening={false}
        perfectDrawEnabled={false}
      />

      {fogStrokes.map((s) => (
        <Line
          key={s.id}
          points={s.points}
          stroke="black"
          strokeWidth={s.radius}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation="destination-out"
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}

      {fogSquares.map((o) => (
        <Rect
          key={o.id}
          x={o.x + o.width / 2}
          y={o.y + o.height / 2}
          width={o.width}
          height={o.height}
          offsetX={o.width / 2}
          offsetY={o.height / 2}
          fill="black"
          opacity={1}
          globalCompositeOperation="destination-out"
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}

      {fogCircles.map((o) => (
        <Ellipse
          key={o.id}
          x={o.x + o.width / 2}
          y={o.y + o.height / 2}
          radiusX={o.width / 2}
          radiusY={o.height / 2}
          fill="black"
          opacity={1}
          globalCompositeOperation="destination-out"
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}
    </Group>
  );
}
