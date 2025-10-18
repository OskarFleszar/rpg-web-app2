import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import type Konva from "konva";
import Toolbar from "./Toolbar";
import { usePanZoom } from "./hooks/usePanZoom";
import { useSnapshot } from "./hooks/useSnapshot";
import { useWsIncoming } from "./hooks/useWsIncoming";
import { usePencil } from "./hooks/usePencil";
import { useEraser } from "./hooks/useEraser";
import { getPointerOnLayer } from "./utils/konvaCoords";
import { type Tool, type Stroke, type Drawable, isStroke } from "./types";
import { useUndo } from "./hooks/useUndo";

type Props = { boardId: number };

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

  // Adapter dla starego kodu (jeśli gdzieś potrzebujesz „strokes”):
  const strokes = useMemo(() => objects.filter(isStroke), [objects]);
  useSnapshot(boardId, setObjects);
  const currentUserId: string = localStorage.getItem("userId")!;

  const strokesRef = useRef<Map<string, Stroke>>(new Map());
  useEffect(() => {
    const m = strokesRef.current;
    m.clear();
    for (const s of strokes) m.set(s.id, s);
  }, [strokes]);

  const isMine = useCallback(
    (id: string) => {
      const s = strokesRef.current.get(id);
      console.log(!!s && s.ownerId === currentUserId);
      return !!s && s.ownerId === currentUserId;
    },
    [currentUserId]
  );

  const [tool, setTool] = useState<Tool>("hand");
  const [color, setColor] = useState("#222222");
  const [width, setWidth] = useState(3);
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
    useWsIncoming(boardId, setObjects, clientId);

  const undo = useUndo({
    boardId,
    clientId,
    currentUserId,
    strokes,
    markPendingRemoval,
  });

  const pencil = usePencil({
    boardId,
    stageRef,
    layerRef,
    color,
    width,
    clientId,
    addMyPath,
    removeMyPath,
    setObjects,
    currentUserId,
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
    strokes,
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
  }
  function onPointerMove() {
    updatePointer();
    if (tool === "pencil") return pencil.onPointerMove();
    if (tool === "eraser") return erMove();
  }
  function onPointerUp() {
    if (tool === "pencil") return pencil.onPointerUp();
    if (tool === "eraser") return erUp();
  }

  return (
    <div className="canvas-container">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        width={width}
        setWidth={setWidth}
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
          {objects.map((o) =>
            o.type === "stroke" ? (
              <Line
                key={o.id}
                points={o.points}
                stroke={o.color}
                strokeWidth={o.width}
                lineCap="round"
                lineJoin="round"
                opacity={
                  (erasePreview.has(o.id) && isMine(o.id)) ||
                  pendingRemoval.has(o.id)
                    ? 0
                    : 1
                }
              />
            ) : null
          )}

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
