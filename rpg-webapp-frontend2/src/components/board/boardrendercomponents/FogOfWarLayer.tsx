import { Group, Line, Rect } from "react-konva";
import type { Drawable, FogStroke } from "../types";
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

  useEffect(() => {
    setFogStrokes(objects.filter((o): o is FogStroke => o.type === "fog"));
    console.log(objects);
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
    </Group>
  );
}
