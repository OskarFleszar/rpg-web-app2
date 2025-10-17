import { useEffect } from "react";
import axios from "axios";
import type { Stroke } from "../types";
import type { Snapshot } from "../ops";

export function useSnapshot(
  boardId: number,
  setStrokes: (s: Stroke[]) => void
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
          if (obj.type !== "stroke") continue;
          const points = Array.isArray(obj.points?.[0])
            ? (obj.points as number[][]).flat()
            : (obj.points as number[]) ?? [];
          all.push({
            id: obj.pathId,
            color: obj.color,
            width: obj.width,
            points,
            ownerId: String(obj.ownerId ?? ""),
          });
        }
      }
      setStrokes(all);

      console.log(all);
    }
    loadBoard().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [boardId, setStrokes]);
}
