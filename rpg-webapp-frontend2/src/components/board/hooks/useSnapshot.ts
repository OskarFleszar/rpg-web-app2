import { useEffect } from "react";
import axios from "axios";
import type { Drawable } from "../types";
import { apiObjectToDrawable } from "../utils/apiToDrawable";

type ApiStroke = {
  type: "stroke";
  objectId: string;
  points: number[] | number[][];
  color: string;
  width: number;
  ownerId: string | number;
};

type ApiShape = {
  type: "shape" | null;
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
          const d = apiObjectToDrawable(o);
          if (d) all.push(d);
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
