import { useEffect } from "react";
import axios from "axios";
import type { Drawable, Stroke } from "../types";
import type { Snapshot } from "../ops";

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
      const snap: Snapshot = res.data;
      if (cancelled) return;

      const all: Stroke[] = [];
      for (const layer of snap.layers ?? []) {
        for (const obj of layer.objects ?? []) {
          if (obj.type === "stroke") {
            const points = Array.isArray(obj.points?.[0])
              ? (obj.points as number[][]).flat()
              : (obj.points as number[]) ?? [];
            all.push({
              type: "stroke",
              id: obj.pathId,
              color: obj.color,
              strokeWidth: obj.width,
              points,
              ownerId: String(obj.ownerId ?? ""),
            });
          }
          if (obj.type === "rect") {
            all.push({
              type: "rect",
              id: obj.id,
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
              color: obj.color,
              strokeWidth: obj.strokeWidth,
              ownerId: obj.ownerId,
            });
          }

          if (obj.type === "ellipse") {
            all.push({
              type: "ellipse",
              id: obj.id,
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
              color: obj.color,
              strokeWidth: obj.strokeWidth,
              ownerId: obj.ownerId,
            });
          }
        }
      }
      setObjects(all);

      console.log(all);
    }
    loadBoard().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [boardId, setObjects]);
}
