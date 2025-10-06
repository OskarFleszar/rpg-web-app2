import React, { useCallback, useEffect, useRef, useState } from "react";
import { useChannel, usePublish } from "../../../ws/hooks"; // ścieżkę dostosuj do siebie
import type { BoardOp, Snapshot, StrokeAppendOp, StrokeStartOp } from "./ops";

type Props = {
  boardId: number; // ID tablicy (musi istnieć po stronie backendu)
  layerId?: string; // np. "base"
  initialColor?: string; // np. "#222222"
  initialWidth?: number; // np. 3
};

export default function BoardCanvas({
  boardId,
  layerId = "base",
  initialColor = "#222222",
  initialWidth = 3,
}: Props) {
  const publish = usePublish();

  // refs do canvasa i kontekstu
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // stan narzędzia
  const [color, setColor] = useState(initialColor);
  const [width, setWidth] = useState<number>(initialWidth);

  // czy aktualnie rysujemy
  const drawingRef = useRef(false);
  // identyfikator aktualnej ścieżki
  const pathIdRef = useRef<string | null>(null);

  // bufor punktów do wysyłki (append co ~40ms)
  const pendingPointsRef = useRef<number[][]>([]);
  const flushTimerRef = useRef<number | null>(null);

  // stan zdalnych ścieżek (po to, by wiedzieć skąd prowadzić następną linię)
  // pathId -> lastPoint + styl
  const remoteStateRef = useRef<
    Map<string, { last?: [number, number]; color: string; width: number }>
  >(new Map());

  // DPI scaling + resize
  const fitToContainer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    // Opcjonalnie: czyścić canvas przy resize (tu: czyści)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    fitToContainer();
    window.addEventListener("resize", fitToContainer);
    return () => window.removeEventListener("resize", fitToContainer);
  }, [fitToContainer]);

  // Rysowanie linii od A do B (na lokalnym canvasie)
  const drawSegment = useCallback(
    (from: [number, number], to: [number, number], col: string, w: number) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(to[0], to[1]);
      ctx.stroke();
    },
    []
  );

  // Flush bufora appendów do WS
  const flushAppend = useCallback(() => {
    const points = pendingPointsRef.current;
    if (points.length === 0) return;
    const pid = pathIdRef.current;
    if (!pid) return;
    const op: StrokeAppendOp = {
      type: "stroke.append",
      boardId,
      pathId: pid,
      points: points.splice(0, points.length), // wyczyść bufor
    };
    publish(`/app/board.${boardId}.op`, op);
  }, [boardId, publish]);

  // start timera do flush co ~40ms
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

  // Konwersja event -> współrzędne w CSS pixels (skalowanie już robi kontekst przez scale(dpr))
  const getXY = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return [Math.round(x), Math.round(y)];
  };

  // Pointer down = stroke.start
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pid = (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : `${Date.now()}-${Math.random()}`;
    pathIdRef.current = pid;

    const op: StrokeStartOp = {
      type: "stroke.start",
      boardId,
      layerId,
      pathId: pid,
      color,
      width,
    };
    publish(`/app/board.${boardId}.op`, op);

    // dodaj pierwszy punkt do bufora append
    pendingPointsRef.current.push(getXY(e));
    ensureFlushTimer();
  };

  // Pointer move = lokalne rysowanie + dopisywanie punktów do bufora
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const pt = getXY(e);

    // Dorysuj lokalnie (od ostatniego zapisanego punktu w buforze)
    const buf = pendingPointsRef.current;
    const prev = buf.length > 0 ? (buf[buf.length - 1] as number[]) : null;
    if (prev) {
      drawSegment([prev[0], prev[1]], [pt[0], pt[1]], color, width);
    }
    buf.push(pt);
  };

  // Pointer up = flush append + stroke.end
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    // doślij ostatnie punkty
    flushAppend();
    clearFlushTimer();

    const pid = pathIdRef.current;
    pathIdRef.current = null;
    if (!pid) return;

    const endOp = { type: "stroke.end", boardId, pathId: pid };
    publish(`/app/board.${boardId}.op`, endOp);
  };

  // Odbiór operacji z serwera (i od innych klientów)
  useChannel<BoardOp>(`/topic/board.${boardId}.op`, (op) => {
    if (!op || typeof (op as any).type !== "string") return;
    switch (op.type) {
      case "stroke.start": {
        // zapamiętaj styl i wyczyść last point
        remoteStateRef.current.set(op.pathId, {
          color: op.color,
          width: op.width,
          last: undefined,
        });
        break;
      }
      case "stroke.append": {
        const s = remoteStateRef.current.get(op.pathId);
        if (!s) {
          // jeśli z jakiegoś powodu append przyszedł przed startem: załóż defaulty
          remoteStateRef.current.set(op.pathId, {
            color: "#000",
            width: 2,
            last: undefined,
          });
        }
        const state = remoteStateRef.current.get(op.pathId)!;
        const pts = op.points ?? [];
        // rysuj segmenty (last -> pierwszy punkt, potem kolejne)
        let last = state.last;
        for (const p of pts) {
          const curr: [number, number] = [p[0], p[1]];
          if (last) {
            drawSegment(last, curr, state.color, state.width);
          }
          last = curr;
        }
        state.last = last;
        break;
      }
      case "stroke.end": {
        // można posprzątać stan ścieżki
        remoteStateRef.current.delete(op.pathId);
        break;
      }
      case "object.remove": {
        // proste demo: czyścimy cały canvas (w praktyce: trzeba by odtworzyć snapshot)
        // Tu zostawiamy TODO – pełna rekonstrukcja to osobny temat.
        break;
      }
      default:
        break;
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot() {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;

      // 1) ściągnij JSON
      const res = await fetch(
        `http://localhost:8080/api/board/${boardId}/state`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) return;
      const snap: Snapshot = await res.json();
      if (cancelled) return;

      // 2) wyczyść canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 3) odrysuj warstwami
      for (const layer of snap.layers ?? []) {
        for (const obj of layer.objects ?? []) {
          if (obj.type === "stroke") {
            drawStrokeFromPoints(ctx, obj.points, obj.color, obj.width);
          }
          // TODO: w przyszłości: image, rect, text, ...
        }
      }
    }

    loadSnapshot().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  function drawStrokeFromPoints(
    ctx: CanvasRenderingContext2D,
    pts: any, // może być number[] (spłaszczone) lub number[][] (append-y)
    color: string,
    width: number
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Obsłuż oba formaty:
    if (Array.isArray(pts) && pts.length > 0) {
      // 1) jeśli to [[x,y], [x,y], ...]
      if (Array.isArray(pts[0])) {
        const arr = pts as number[][];
        ctx.beginPath();
        ctx.moveTo(arr[0][0], arr[0][1]);
        for (let i = 1; i < arr.length; i++) {
          ctx.lineTo(arr[i][0], arr[i][1]);
        }
        ctx.stroke();
        return;
      }

      // 2) jeśli to [x0, y0, x1, y1, ...] (spłaszczone)
      const flat = pts as number[];
      if (flat.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(flat[0], flat[1]);
        for (let i = 2; i < flat.length; i += 2) {
          ctx.lineTo(flat[i], flat[i + 1]);
        }
        ctx.stroke();
      }
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr",
        height: "100%",
        gap: 8,
      }}
    >
      {/* Panel narzędzi */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Width:
          <input
            type="number"
            min={1}
            max={50}
            value={width}
            onChange={(e) =>
              setWidth(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
            }
            style={{ width: 64 }}
          />
        </label>
      </div>

      {/* Canvas */}
      <div
        style={{
          position: "relative",
          border: "1px solid #ddd",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "500px",
            touchAction: "none",
            cursor: "crosshair",
            display: "block",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>
    </div>
  );
}
