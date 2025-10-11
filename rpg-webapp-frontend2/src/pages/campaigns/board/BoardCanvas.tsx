import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./BoardCanvas.css";
import { Circle, Layer, Line, Stage } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { BoardOp, Snapshot, StrokeAppendOp, StrokeStartOp } from "./ops";
import { useChannel, usePublish } from "../../../ws/hooks";
import axios from "axios";

type BoardCanvasProps = {
  boardId: number;
};

type Tool = "hand" | "pencil";

type Stroke = {
  id: string;
  points: number[];
  color: string;
  width: number;
};

export default function BoardCanvas({ boardId }: BoardCanvasProps) {
  //WINDOW SIZE AND RESIZING

  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function onResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    onResize();
    window.addEventListener("resize", onResize);
    console.log(boardId);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  //WS HANDLING

  const publish = usePublish();

  const clientId = useMemo(
    () => (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    []
  );

  const myActivePathsRef = useRef<Set<string>>(new Set());

  const pendingPointsRef = useRef<number[][]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const pathIdRef = useRef<string | null>(null);

  const remoteStrokesRef = useRef<
    Map<string, { last?: [number, number]; color: string; width: number }>
  >(new Map());

  const flushAppend = useCallback(() => {
    const pts = pendingPointsRef.current;
    if (!pts.length || !pathIdRef.current) return;

    const op: StrokeAppendOp = {
      type: "stroke.append",
      boardId,
      pathId: pathIdRef.current,
      points: pts.splice(0, pts.length),
      clientId,
    };
    publish(`/app/board.${boardId}.op`, op);
  }, [boardId, publish]);

  const ensureFlushTimer = useCallback(() => {
    if (flushTimerRef.current != null) return;
    flushTimerRef.current = window.setInterval(() => {
      flushAppend();
    }, 40) as unknown as number;
  }, [flushAppend]);

  const clearFlushTimer = useCallback(() => {
    if (flushTimerRef.current != null) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  useChannel<BoardOp>(`/topic/board.${boardId}.op`, (op) => {
    if (!op || typeof (op as any).type !== "string") return;

    if (
      "pathId" in op &&
      op.pathId &&
      myActivePathsRef.current.has(op.pathId)
    ) {
      return;
    }

    switch (op.type) {
      case "stroke.start": {
        remoteStrokesRef.current.set(op.pathId, {
          color: op.color,
          width: op.width,
          last: undefined,
        });
        break;
      }
      case "stroke.append": {
        const s = remoteStrokesRef.current.get(op.pathId);
        if (!s) {
          remoteStrokesRef.current.set(op.pathId, {
            color: "#000",
            width: 2,
            last: undefined,
          });
        }
        const state = remoteStrokesRef.current.get(op.pathId)!;

        setStrokes((prev) => {
          const idx = prev.findIndex((st) => st.id === op.pathId);
          if (idx === -1) {
            const firstPts = op.points ?? [];
            const flat = firstPts.flat();
            const newStroke: Stroke = {
              id: op.pathId,
              color: state.color,
              width: state.width,
              points: flat,
            };
            return [...prev, newStroke];
          } else {
            // dopnij punkty
            const add = (op.points ?? []).flat();
            if (add.length === 0) return prev;
            const updated = {
              ...prev[idx],
              points: [...prev[idx].points, ...add],
            };
            const copy = prev.slice();
            copy[idx] = updated;
            return copy;
          }
        });

        const lastPts = op.points ?? [];
        if (lastPts.length) {
          const last = lastPts[lastPts.length - 1]!;
          state.last = [last[0], last[1]];
        }
        break;
      }
      case "stroke.end": {
        // opcjonalnie sprzątanie
        remoteStrokesRef.current.delete(op.pathId);
        break;
      }
      default:
        break;
    }
  });

  useEffect(() => {
    let cancelled = false;
    async function loadBoard() {
      const res = await axios.get(
        `http://localhost:8080/api/board/${boardId}/state`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const snap: Snapshot = res.data;
      if (cancelled) return;
      const all: Stroke[] = [];
      for (const layer of snap.layers ?? []) {
        for (const obj of layer.objects ?? []) {
          if (obj.type !== "stroke") continue;
          // w zależności od formatu: points może być number[][] albo flat number[]
          const points = Array.isArray(obj.points?.[0])
            ? (obj.points as number[][]).flat()
            : (obj.points as number[]) ?? [];
          all.push({
            id: obj.pathId,
            color: obj.color,
            width: obj.width,
            points,
          });
        }
      }
      setStrokes(all);
    }
    loadBoard().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  //DRAWING

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState("#222222");
  const [width, setWidth] = useState(3);

  const drawingRef = useRef(false);

  const drawLayerRef = useRef<Konva.Layer | null>(null);

  function getPointerOnDrawLayer(): { x: number; y: number } | null {
    const stage = stageRef.current;
    const layer = drawLayerRef.current;
    if (!stage || !layer) return null;

    const pos = stage.getPointerPosition();
    if (!pos) return null;

    const t = layer.getAbsoluteTransform().copy();
    t.invert();
    return t.point(pos);
  }

  function onStagePointerDown(e: Konva.KonvaEventObject<PointerEvent>) {
    if (tool !== "pencil") return;

    const pt = getPointerOnDrawLayer();
    if (!pt) return;

    drawingRef.current = true;
    const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

    pathIdRef.current = id;
    myActivePathsRef.current.add(id);

    const opStart: StrokeStartOp = {
      type: "stroke.start",
      boardId,
      layerId: "base",
      pathId: id,
      color,
      width,
      clientId,
    };
    publish(`/app/board.${boardId}.op`, opStart);
    pendingPointsRef.current.push([pt.x, pt.y]);
    ensureFlushTimer();

    setStrokes((prev) => [...prev, { id, points: [pt.x, pt.y], color, width }]);
  }

  function onStagePointerMove(e: Konva.KonvaEventObject<PointerEvent>) {
    if (tool !== "pencil" || !drawingRef.current) return;

    const pt = getPointerOnDrawLayer();
    if (!pt) return;

    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];

      const L = last.points.length;
      if (L >= 2) {
        const dx = pt.x - last.points[L - 2];
        const dy = pt.y - last.points[L - 1];
        if (dx * dx + dy * dy < 1) return prev;
      }
      pendingPointsRef.current.push([pt.x, pt.y]);
      const updated = { ...last, points: [...last.points, pt.x, pt.y] };
      return [...prev.slice(0, -1), updated];
    });
  }

  function onStagePointerUp(e: Konva.KonvaEventObject<PointerEvent>) {
    if (tool !== "pencil") return;

    flushAppend();
    clearFlushTimer();

    const pid = pathIdRef.current;
    pathIdRef.current = null;
    drawingRef.current = false;

    if (pid) {
      myActivePathsRef.current.delete(pid);
      publish(`/app/board.${boardId}.op`, {
        type: "stroke.end",
        boardId,
        pathId: pid,
        clientId,
      });
    }
  }

  //TOOLS WHEEL AND PANING

  const [tool, setTool] = useState<Tool>("hand");

  const stageRef = useRef<Konva.Stage | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const onWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const oldScale = stageScale;
    const dir = e.evt.deltaY > 0 ? 1 : -1;
    const next = dir > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const newScale = Math.max(0.2, Math.min(5, next));

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const onDragMove = (e: any) => setStagePos(e.target.position());
  const onDragStart = () => setIsPanning(true);
  const onDragEnd = () => setIsPanning(false);

  const cursor =
    tool === "hand" ? (isPanning ? "grabbing" : "grab") : "crosshair";

  return (
    <div className="canvas-container">
      <div
        className={`board-toolbar ${tool === "pencil" ? "pencil-open" : ""}`}
      >
        <button
          className={`tool-button ${tool === "hand" ? "active" : ""}`}
          title="Pan"
          onClick={() => setTool("hand")}
        >
          ✋
        </button>

        <div className={`pencil-select ${tool === "pencil" ? "open" : ""}`}>
          <button
            className={`tool-button ${tool === "pencil" ? "active" : ""}`}
            title="Pencil"
            onClick={() => setTool(tool === "pencil" ? "hand" : "pencil")}
          >
            ✏️
          </button>

          <div className="drawing-settings">
            <label className="tool-tile">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>

            <label className="tool-tile">
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </label>
          </div>
        </div>
      </div>
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
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
        onPointerLeave={onStagePointerUp}
        onPointerCancel={onStagePointerUp}
        style={{ cursor, background: "#fff" }}
      >
        <Layer ref={drawLayerRef}>
          {strokes.map((s) => (
            <Line
              key={s.id}
              points={s.points}
              stroke={s.color}
              strokeWidth={s.width}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          <Circle x={240} y={180} radius={60} fill="#4f46e5" shadowBlur={10} />
        </Layer>
      </Stage>
    </div>
  );
}
