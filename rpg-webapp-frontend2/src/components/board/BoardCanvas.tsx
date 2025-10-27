import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Ellipse, Layer, Line, Rect, Stage } from "react-konva";
import type Konva from "konva";
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

type Props = { boardId: number };

type PushUndo = (
  a: { kind: "draw"; objectId: string } | { kind: "erase"; objectIds: string[] }
) => void;

export default function BoardCanvas({ boardId }: Props) {
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
      console.log(!!o && o.ownerId === currentUserId);
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
  const { addMyPath, removeMyPath, markPendingRemoval, pendingRemoval } =
    useWsIncoming(boardId, setObjects, clientId, {
      pushUndo: (a) => pushUndoRef.current?.(a),
      shouldIgnoreEraseApplied: (ids) =>
        !!shouldIgnoreEraseAppliedRef.current?.(ids),
    });

  const { undo, pushUndo, shouldIgnoreEraseApplied } = useUndo({
    boardId,
    clientId,
    objects,
    markPendingRemoval,
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
  });

  const [pointerOnLayer, setPointerOnLayer] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const updatePointer = () => {
    const pt = getPointerOnLayer(stageRef, layerRef);
    if (pt) setPointerOnLayer(pt);
  };

  function onPointerDown() {
    if (tool === "pencil") return pencil.onPointerDown();
    if (tool === "eraser") return erDown();
    if (tool === "rect" || tool === "ellipse") return shapes.onPointerDown();
  }
  function onPointerMove() {
    updatePointer();
    if (tool === "pencil") return pencil.onPointerMove();
    if (tool === "eraser") return erMove();
    if (tool === "rect" || tool === "ellipse") return shapes.onPointerMove();
  }
  function onPointerUp() {
    if (tool === "pencil") return pencil.onPointerUp();
    if (tool === "eraser") return erUp();
    if (tool === "rect" || tool === "ellipse") {
      console.log("pointerup");
      return shapes.onPointerUp();
    }
  }

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
        draggable={tool === "hand"}
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
              return (
                <Rect
                  key={o.id}
                  x={o.x}
                  y={o.y}
                  width={o.width}
                  height={o.height}
                  stroke={o.color}
                  strokeWidth={o.strokeWidth}
                />
              );
            }
            if (o.type === "ellipse") {
              const cx = o.x + o.width / 2;
              const cy = o.y + o.height / 2;
              return (
                <Ellipse
                  key={o.id}
                  x={cx}
                  y={cy}
                  radiusX={o.width / 2}
                  radiusY={o.height / 2}
                  stroke={o.color}
                  strokeWidth={o.strokeWidth}
                />
              );
            }
            return null;
          })}

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
