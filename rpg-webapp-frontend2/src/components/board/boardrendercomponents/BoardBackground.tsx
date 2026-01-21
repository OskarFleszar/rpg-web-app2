import { memo } from "react";
import { Rect, Image as KonvaImage } from "react-konva";

type BoardBackgroundProps = {
  background: HTMLImageElement | undefined;
  boardWidth: number;
  boardHeight: number;
};

export const BoardBackground = memo(function BoardBackground({
  background,
  boardWidth,
  boardHeight,
}: BoardBackgroundProps) {
  if (background) {
    return (
      <KonvaImage
        image={background}
        x={0}
        y={0}
        width={boardWidth}
        height={boardHeight}
        listening={false}
        perfectDrawEnabled={false}
      />
    );
  }

  return (
    <Rect
      x={0}
      y={0}
      width={boardWidth}
      height={boardHeight}
      fill="white"
      stroke="black"
      listening={false}
      perfectDrawEnabled={false}
    />
  );
});
