import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  Ellipse,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer,
} from "react-konva";
import Konva from "konva";
import Toolbar from "./Toolbar";
import { usePanZoom } from "./hooks/usePanZoom";
import { useSnapshot } from "./hooks/useSnapshot";
import { useWsIncoming } from "./hooks/useWsIncoming";
import { usePencil } from "./hooks/usePencil";
import { useEraser } from "./hooks/useEraser";
import { getPointerOnLayer } from "./utils/konvaCoords";
import { type Tool, type Drawable } from "./types";
import { useUndo } from "./hooks/useUndo";
import { useShape } from "./hooks/useShape";
import { usePointer } from "./hooks/usePointer";

type Props = {
  boardId: number;
  isGM: boolean;
  setActiveBoardId: React.Dispatch<React.SetStateAction<number | null>>;
  campaignId: string | undefined;
};

type PushUndo = (
  a: { kind: "draw"; objectId: string } | { kind: "erase"; objectIds: string[] }
) => void;

export default function BoardCanvas({
  boardId,
  isGM,
  setActiveBoardId,
  campaignId,
}: Props) {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [objects, setObjects] = useState<Drawable[]>([]);
  const pushUndoRef = useRef<PushUndo | null>(null);
  const shouldIgnoreEraseAppliedRef = useRef<
    ((ids: string[]) => boolean) | null
  >(null);
  useSnapshot(boardId, setObjects);
  const currentUserId: string = localStorage.getItem("userId")!;

  const objectsRef = useRef<Map<string, Drawable>>(new Map());

  useEffect(() => {
    const m = objectsRef.current;
    m.clear();
    for (const s of objects) m.set(s.id, s);
  }, [objects]);

  const isMine = useCallback(
    (id: string) => {
      const o = objectsRef.current.get(id);
      return !!o && o.ownerId === currentUserId;
    },
    [currentUserId]
  );

  const [tool, setTool] = useState<Tool>("hand");
  const [color, setColor] = useState("#222222");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [eraserSize, setEraserSize] = useState(20);

  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const {
    stageScale,
    stagePos,
    isPanning,
    onWheel,
    onDragMove,
    onDragStart,
    onDragEnd,
    enabled,
    setEnabled,
  } = usePanZoom();

  const cursor =
    tool === "hand"
      ? isPanning
        ? "grabbing"
        : "grab"
      : tool === "eraser"
      ? "none"
      : "crosshair";

  const clientId = useMemo(
    () => crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    []
  );

  const pointer = usePointer({
    active: tool === "pointer",
    boardId,
    clientId,
    objects,
    setObjects,
    currentUserId,
    isGM,
    layerRef,
    setPanZoomEnabled: setEnabled,
  });

  const { addMyPath, removeMyPath, markPendingRemoval, pendingRemoval } =
    useWsIncoming(boardId, setObjects, clientId, setActiveBoardId, campaignId, {
      pushUndo: (a) => pushUndoRef.current?.(a),
      shouldIgnoreEraseApplied: (ids) =>
        !!shouldIgnoreEraseAppliedRef.current?.(ids),
      OnBoardCleared: () => pointer.clearSelection(),
    });

  const { pushUndo, shouldIgnoreEraseApplied } = useUndo({
    boardId,
    clientId,
    objects,
    markPendingRemoval,
    isGM,
  });

  useEffect(() => {
    pushUndoRef.current = pushUndo;
    shouldIgnoreEraseAppliedRef.current = shouldIgnoreEraseApplied;
  }, [pushUndo, shouldIgnoreEraseApplied]);

  const pencil = usePencil({
    boardId,
    stageRef,
    layerRef,
    color,
    strokeWidth,
    clientId,
    addMyPath,
    removeMyPath,
    setObjects,
    currentUserId,
  });

  const shapes = useShape({
    kind: tool === "rect" ? "rect" : "ellipse",
    boardId,
    stageRef,
    layerRef,
    color,
    strokeWidth,
    clientId,
    currentUserId,
    setObjects,
  });

  const {
    onPointerDown: erDown,
    onPointerMove: erMove,
    onPointerUp: erUp,
    erasePreview,
  } = useEraser({
    boardId,
    stageRef,
    layerRef: layerRef,
    radius: eraserSize / 2,
    clientId,
    objects,
    setObjects,
    markPendingRemoval,
    isMine,
    isGM,
  });

  useEffect(() => {
    if (tool !== "pointer") pointer.clearSelection();
  }, [tool, pointer]);

  const [pointerOnLayer, setPointerOnLayer] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const updatePointer = () => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (pt) setPointerOnLayer(pt);
  };

  function onPointerDown(e: any) {
    if (tool === "pencil") return pencil.onPointerDown();
    if (tool === "eraser") return erDown();
    if (tool === "rect" || tool === "ellipse") return shapes.onPointerDown();
    if (tool === "pointer") return pointer.onStagePointerDown(e);
  }
  function onPointerMove() {
    if (
      tool === "eraser" ||
      tool === "pencil" ||
      tool === "rect" ||
      tool === "ellipse"
    ) {
      updatePointer();
    }
    if (tool === "pencil") return pencil.onPointerMove();
    if (tool === "eraser") return erMove();
    if (tool === "rect" || tool === "ellipse") return shapes.onPointerMove();
    if (tool === "pointer") return;
  }

  function onPointerUp() {
    if (tool === "pencil") return pencil.onPointerUp();
    if (tool === "eraser") return erUp();
    if (tool === "rect" || tool === "ellipse") {
      console.log("pointerup");
      return shapes.onPointerUp();
    }
    if (tool === "pointer") return;
  }

  const selectableProps = (o: Drawable) => ({
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
      pointer.selectedId === o.id &&
      (isMine(o.id) || isGM),

    onDragStart: tool === "pointer" ? pointer.onDragStart : undefined,
    onDragEnd: tool === "pointer" ? pointer.onDragEnd : undefined,
    onTransformStart: tool === "pointer" ? pointer.onTransformStart : undefined,
    onTransformEnd: tool === "pointer" ? pointer.onTransformEnd : undefined,
  });

  return (
    <div className="canvas-container">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        width={strokeWidth}
        setWidth={setStrokeWidth}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
      />

      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={tool === "hand" && enabled}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor, background: "#fff" }}
      >
        <Layer ref={layerRef}>
          {objects.map((o) => {
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

          <Rect
            visible={false}
            listening={false}
            fill="rgba(59,130,246,0.15)"
            stroke="#3b82f6"
            dash={[4, 4]}
          />

          <Transformer
            ref={pointer.trRef}
            rotateEnabled
            enabledAnchors={[
              "top-left",
              "top-center",
              "top-right",
              "middle-left",
              "middle-right",
              "bottom-left",
              "bottom-center",
              "bottom-right",
            ]}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
            }
          />

          {tool === "eraser" && pointerOnLayer && (
            <Circle
              x={pointerOnLayer.x}
              y={pointerOnLayer.y}
              radius={eraserSize / 2}
              stroke="#3b82f6"
              dash={[6, 4]}
              opacity={0.9}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
