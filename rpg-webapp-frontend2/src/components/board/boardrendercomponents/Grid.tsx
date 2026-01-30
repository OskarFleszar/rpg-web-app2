import { memo, type JSX } from "react";
import { Line } from "react-konva";

type GridProps = {
  meta: {
    cols: number;
    rows: number;
    cellSize: number;
  };
  boardWidth: number;
  boardHeight: number;
};

export const Grid = memo(function Grid({
  meta,
  boardHeight,
  boardWidth,
}: GridProps) {
  const lines: JSX.Element[] = [];

  for (let i = 0; i <= meta.cols; i++) {
    const x = i * meta.cellSize;
    lines.push(
      <Line
        key={`v-${i}`}
        points={[x, 0, x, boardHeight]}
        stroke="black"
        strokeWidth={1}
        opacity={0.45}
        listening={false}
        perfectDrawEnabled={false}
      />,
    );
  }

  for (let j = 0; j <= meta.rows; j++) {
    const y = j * meta.cellSize;
    lines.push(
      <Line
        key={`h-${j}`}
        points={[0, y, boardWidth, y]}
        stroke="black"
        strokeWidth={1}
        opacity={0.45}
        listening={false}
        perfectDrawEnabled={false}
      />,
    );
  }

  return lines;
});
