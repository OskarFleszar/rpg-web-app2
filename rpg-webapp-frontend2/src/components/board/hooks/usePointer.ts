/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import Konva from "konva";
import { usePublish } from "../../../ws/hooks";
import type { Drawable } from "../types";

type ChangedStroke = { id: string; kind: "stroke"; points: number[] };
type ChangedShape = {
  id: string;
  kind: "rect" | "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};
type Changed = ChangedStroke | ChangedShape;

export function usePointer(opts: {
  active: boolean;
  boardId: number;
  clientId: string;
  objects: Drawable[];
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
  currentUserId: string;
  isGM: boolean;
  layerRef: React.RefObject<Konva.Layer | null>;
}) {
  const { active, boardId, clientId, objects, currentUserId, isGM, layerRef } =
    opts;
  const publish = usePublish();

  // tylko JEDEN wybrany obiekt
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Refs Konvy
  const trRef = useRef<Konva.Transformer | null>(null);
  const nodeRefs = useRef(new Map<string, Konva.Node>());

  // snapshot geometrii „przed” (dla wybranego)
  const beforeRef = useRef<Drawable | null>(null);

  const canEdit = useCallback(
    (id: string) => {
      const o = objects.find((x) => x.id === id);
      if (!o) return false;
      return isGM || o.ownerId === String(currentUserId);
    },
    [objects, isGM, currentUserId]
  );

  // REJESTRACJA NODE'ÓW
  const bindNodeRef = useCallback(
    (id: string) => (node: Konva.Node | null) => {
      if (node) {
        node.setAttr("data-id", id);
        nodeRefs.current.set(id, node);
        // jeśli to właśnie wybrany – podłącz do Transformera
        if (selectedId === id && trRef.current) {
          trRef.current.nodes([node]);
          layerRef.current?.batchDraw();
        }
      } else {
        nodeRefs.current.delete(id);
      }
    },
    [selectedId, layerRef]
  );

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    trRef.current?.nodes([]);
    layerRef.current?.batchDraw();
  }, [layerRef]);

  // po wyłączeniu narzędzia – czyścimy
  useEffect(() => {
    if (!active) clearSelection();
  }, [active, clearSelection]);

  // jeśli usunięto obiekt – czyścimy wybór
  useEffect(() => {
    if (!selectedId) return;
    if (!objects.some((o) => o.id === selectedId)) {
      clearSelection();
    }
  }, [objects, selectedId, clearSelection]);

  // KLIK NA OBIEKT – wybierz pojedynczy
  const onNodePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>, id: string) => {
      if (!active) return;
      if (!canEdit(id)) return;

      setSelectedId(id);
      const node = nodeRefs.current.get(id);
      if (node && trRef.current) {
        trRef.current.nodes([node]); // tylko ten jeden
        layerRef.current?.batchDraw();
      }

      e.cancelBubble = true; // nie puszczaj do Stage
    },
    [active, canEdit, layerRef]
  );

  // KLIK W PUSTE TŁO – odznacz
  const onStagePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!active) return;
      if (e.target !== e.target.getStage()) return;
      clearSelection();
    },
    [active, clearSelection]
  );

  // snapshot „przed”
  const snapshotBefore = useCallback(() => {
    if (!selectedId) return;
    const o = objects.find((x) => x.id === selectedId);
    beforeRef.current = o ? JSON.parse(JSON.stringify(o)) : null;
  }, [selectedId, objects]);

  const onDragStart = useCallback(() => snapshotBefore(), [snapshotBefore]);
  const onTransformStart = useCallback(
    () => snapshotBefore(),
    [snapshotBefore]
  );

  // eksport zmian JEDNEGO obiektu
  const exportNodeChanges = useCallback(
    (node: Konva.Node, before: Drawable | null): Changed | null => {
      if (!before) return null;

      if (before.type === "stroke") {
        const tr = node.getAbsoluteTransform();
        const out: number[] = [];
        for (let i = 0; i < before.points.length; i += 2) {
          const p = tr.point({ x: before.points[i], y: before.points[i + 1] });
          out.push(p.x, p.y);
        }
        // skali nie zerujemy tutaj – poczekaj na confirm z backendu
        return { id: before.id, kind: "stroke", points: out };
      }

      if (before.type === "rect") {
        const rect = node as Konva.Rect;

        const sx = rect.scaleX() ?? 1;
        const sy = rect.scaleY() ?? 1;
        const rot = rect.rotation() ?? 0;

        // Konva Rect rysujemy z x,y = środek (bo masz offsetX/offsetY = width/2,height/2)
        const cx = rect.x();
        const cy = rect.y();

        const newW = before.width * sx;
        const newH = before.height * sy;

        // 1) Natychmiast przepisz geometrię na „bez skalowania”
        rect.width(newW);
        rect.height(newH);
        rect.x(cx);
        rect.y(cy);
        rect.rotation(rot);
        rect.scaleX(1);
        rect.scaleY(1);

        // 2) Wyślij do backendu top-left (model trzymasz jako top-left):
        const nx = cx - newW / 2;
        const ny = cy - newH / 2;

        return {
          id: before.id,
          kind: "rect",
          x: nx,
          y: ny,
          width: newW,
          height: newH,
          rotation: rot,
        };
      }

      if (before.type === "ellipse") {
        const el = node as Konva.Ellipse;
        const sx = el.scaleX() ?? 1;
        const sy = el.scaleY() ?? 1;
        const rot = el.rotation() ?? 0;

        const cx = el.x();
        const cy = el.y();

        const newW = before.width * sx;
        const newH = before.height * sy;

        // Ellipse w Konvie trzyma radiusy i x,y = środek
        el.radiusX(newW / 2);
        el.radiusY(newH / 2);
        el.x(cx);
        el.y(cy);
        el.rotation(rot);
        el.scaleX(1);
        el.scaleY(1);

        const nx = cx - newW / 2;
        const ny = cy - newH / 2;

        return {
          id: before.id,
          kind: "ellipse",
          x: nx,
          y: ny,
          width: newW,
          height: newH,
          rotation: rot,
        };
      }

      return null;
    },
    []
  );

  // commit tylko dla wybranego
  const commitSelection = useCallback(() => {
    if (!active) return;
    if (!selectedId) return;
    if (!canEdit(selectedId)) return;

    const node = nodeRefs.current.get(selectedId);
    const before = beforeRef.current;
    if (!node || !before) return;

    const ch = exportNodeChanges(node, before);
    if (!ch) return;

    publish(`/app/board.${boardId}.op`, {
      type: "transform.apply",
      boardId,
      clientId,
      changed: [ch], // JEDEN obiekt
    } as const);
  }, [
    active,
    selectedId,
    canEdit,
    exportNodeChanges,
    publish,
    boardId,
    clientId,
  ]);

  const onDragEnd = useCallback(() => commitSelection(), [commitSelection]);
  const onTransformEnd = useCallback(
    () => commitSelection(),
    [commitSelection]
  );

  return {
    selectedId,
    trRef,
    bindNodeRef,
    onNodePointerDown,
    onDragStart,
    onDragEnd,
    onTransformStart,
    onTransformEnd,
    onStagePointerDown,
    clearSelection,
  };
}
