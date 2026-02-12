import { Group, Line, Rect } from "react-konva";
import type { FogStroke } from "../hooks/useFogErase";

type FogOfWarProps = {
  boardWidth: number;
  boardHeight: number;
  fogOfWarOn: boolean;
  isGM: boolean;
  fogStrokes: FogStroke[];
};

export function FogOfWarLayer({
  boardWidth,
  boardHeight,
  fogOfWarOn,
  isGM,
  fogStrokes,
}: FogOfWarProps) {
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
