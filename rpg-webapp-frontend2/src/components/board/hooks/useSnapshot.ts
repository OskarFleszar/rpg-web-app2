import { useEffect } from "react";
import axios from "axios";
import type { Drawable } from "../types";

// --- typy odpowiedzi API (to co zwraca backend) ---
type ApiStroke = {
  type: "stroke";
  objectId: string;
  points: number[] | number[][]; // backend bywa, że zwraca zagnieżdżone
  color: string;
  width: number; // grubość linii
  ownerId: string | number;
};

type ApiShape = {
  type: "shape" | null; // w starszych snapach bywa null
  shape: "rect" | "ellipse";
  objectId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number | null;
  ownerId: string | number;
};

type ApiObject = ApiStroke | ApiShape;
type ApiLayer = { id: string; locked: boolean; objects: ApiObject[] };
type ApiSnapshot = { version: number; layers: ApiLayer[] };
// ----------------------------------------------------

export function useSnapshot(
  boardId: number,
  setObjects: (s: Drawable[]) => void
) {
  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      const res = await axios.get(
        `http://localhost:8080/api/board/${boardId}/state`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (cancelled) return;

      const snap = res.data as ApiSnapshot;
      const all: Drawable[] = [];

      for (const layer of snap.layers) {
        for (const o of layer.objects) {
          if (o.type === "stroke") {
            const pts = Array.isArray((o.points as any)[0])
              ? (o.points as number[][]).flat()
              : (o.points as number[]);
            all.push({
              type: "stroke",
              id: o.objectId,
              points: pts,
              color: o.color,
              strokeWidth: o.width, // w API: width = grubość
              ownerId: String(o.ownerId),
            });
          } else {
            // ApiShape (type może być null)
            const s = o as ApiShape;
            if (s.shape === "rect") {
              all.push({
                type: "rect",
                id: s.objectId,
                x: s.x,
                y: s.y,
                width: s.width,
                height: s.height,
                color: s.color,
                strokeWidth: s.strokeWidth ?? 1,
                ownerId: String(s.ownerId),
              });
            } else if (s.shape === "ellipse") {
              all.push({
                type: "ellipse",
                id: s.objectId,
                x: s.x,
                y: s.y,
                width: s.width,
                height: s.height,
                color: s.color,
                strokeWidth: s.strokeWidth ?? 1,
                ownerId: String(s.ownerId),
              });
            }
          }
        }
      }

      setObjects(all);
    }

    loadBoard().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [boardId, setObjects]);
}
