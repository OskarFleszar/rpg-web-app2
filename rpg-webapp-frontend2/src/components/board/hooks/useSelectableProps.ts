import { useCallback } from "react";
import type Konva from "konva";
import type { Drawable, Tool } from "../types";

type Args = {
  tool: Tool;
  isGM: boolean;
  isMine: (id: string) => boolean;

  pointer: {
    selectedId: string | null;
    bindNodeRef: (id: string) => (node: Konva.Node | null) => void;
    onNodePointerDown: (
      e: Konva.KonvaEventObject<PointerEvent>,
      id: string,
    ) => void;

    onDragStart: () => void;
    onDragEnd: () => void;
    onTransformStart: () => void;
    onTransformEnd: () => void;
  };
};

export function useSelectableProps({ tool, isGM, isMine, pointer }: Args) {
  return useCallback(
    (o: Drawable) => ({
      name: "selectable",
      ref: pointer.bindNodeRef(o.id),
      id: o.id,

      onPointerDown:
        tool === "pointer"
          ? (e: Konva.KonvaEventObject<PointerEvent>) =>
              pointer.onNodePointerDown(e, o.id)
          : undefined,

      draggable:
        tool === "pointer" &&
        (isMine(o.id) || isGM) &&
        (o.type === "token" || pointer.selectedId === o.id),

      onDragStart: tool === "pointer" ? pointer.onDragStart : undefined,
      onDragEnd: tool === "pointer" ? pointer.onDragEnd : undefined,
      onTransformStart:
        tool === "pointer" ? pointer.onTransformStart : undefined,
      onTransformEnd: tool === "pointer" ? pointer.onTransformEnd : undefined,
    }),
    [tool, isGM, isMine, pointer],
  );
}
