import { Rect } from "react-konva";

type FogOfWarProps = {
  boardWidth: number;
  boardHeight: number;
  fogOfWarOn: boolean;
  isGM: boolean;
};

export function FogOfWarLayer({
  boardWidth,
  boardHeight,
  fogOfWarOn,
  isGM,
}: FogOfWarProps) {
  if (!fogOfWarOn) return null;

  return (
    <Rect
      x={0}
      y={0}
      width={boardWidth}
      height={boardHeight}
      fill="black"
      stroke="black"
      opacity={isGM ? 0.7 : 1}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
}
