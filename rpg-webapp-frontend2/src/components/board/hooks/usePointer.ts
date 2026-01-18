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

export function usePointer(opts: {
  active: boolean;
  boardId: number;
  clientId: string;
  objects: Drawable[];
  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
  currentUserId: string;
  isGM: boolean;
  layerRef: React.RefObject<Konva.Layer | null>;
  setPanZoomEnabled?: (v: boolean) => void;
  boardMeta: { cols: number; rows: number; cellSize: number };
}) {
  const {
    active,
    boardId,
    clientId,
    objects,
    currentUserId,
    isGM,
    layerRef,
    setPanZoomEnabled,
    boardMeta,
  } = opts;

  const { cols, rows, cellSize } = boardMeta;
  const publish = usePublish();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const setSelection = useCallback((id: string | null) => {
    selectedIdRef.current = id;
    setSelectedId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    beforeRef.current = null;
    trRef.current?.nodes([]);
    layerRef.current?.batchDraw();
  }, [setSelection, layerRef]);

  const trRef = useRef<Konva.Transformer | null>(null);
  const nodeRefs = useRef(new Map<string, Konva.Node>());

  const refCallbacks = useRef(
    new Map<string, (node: Konva.Node | null) => void>()
  );

  const beforeRef = useRef<Drawable | null>(null);

  const canEdit = useCallback(
    (id: string) => {
      const o = objects.find((x) => x.id === id);
      if (!o) return false;

      return isGM || o.ownerId === String(currentUserId);
    },
    [objects, isGM, currentUserId]
  );

  const bindNodeRef = useCallback((id: string) => {
    const existing = refCallbacks.current.get(id);
    if (existing) return existing;

    const cb = (node: Konva.Node | null) => {
      if (node) {
        node.setAttr("data-id", id);
        nodeRefs.current.set(id, node);
      } else {
        nodeRefs.current.delete(id);
      }
    };

    refCallbacks.current.set(id, cb);
    return cb;
  }, []);

  useEffect(() => {
    if (!active) clearSelection();
  }, [active, clearSelection]);

  useEffect(() => {
    if (!selectedId) {
      trRef.current?.nodes([]);
      layerRef.current?.batchDraw();
      return;
    }

    const node = nodeRefs.current.get(selectedId);
    const obj = objects.find((x) => x.id === selectedId);
    const isToken = obj?.type === "token";

    if (node && trRef.current) {
      trRef.current.nodes(isToken ? [] : [node]);
      trRef.current.getLayer()?.batchDraw();
      layerRef.current?.batchDraw();
    }
  }, [selectedId, objects, layerRef]);

  useEffect(() => {
    if (!selectedId) return;
    if (!objects.some((o) => o.id === selectedId)) {
      clearSelection();
    }
  }, [objects, selectedId, clearSelection]);

  const onNodePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>, id: string) => {
      if (!active) return;
      if (!canEdit(id)) return;

      setSelection(id);
      const node = nodeRefs.current.get(id);
      const obj = objects.find((x) => x.id === id);
      const isToken = obj?.type === "token";

      if (node && trRef.current) {
        trRef.current.nodes(isToken ? [] : [node]);
        trRef.current.getLayer()?.batchDraw();
        layerRef.current?.batchDraw();
      }

      e.cancelBubble = true;
    },
    [active, canEdit, setSelection, layerRef]
  );

  const onStagePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!active) return;
      if (e.target !== e.target.getStage()) return;
      clearSelection();
    },
    [active, clearSelection]
  );

  const snapshotBefore = useCallback(() => {
    const id = selectedIdRef.current;
    if (!id) return;
    const o = objects.find((x) => x.id === id);
    beforeRef.current = o ? JSON.parse(JSON.stringify(o)) : null;
  }, [objects]);

  const lockCamera = useCallback(
    (lock: boolean) => setPanZoomEnabled?.(!lock),
    [setPanZoomEnabled]
  );

  const onDragStart = useCallback(() => {
    lockCamera(true);
    snapshotBefore();
  }, [snapshotBefore, lockCamera]);

  const onTransformStart = useCallback(() => {
    lockCamera(true);
    snapshotBefore();
  }, [snapshotBefore, lockCamera]);

  function sceneToLayerPoint(node: Konva.Node) {
    const layer = node.getLayer();
    const abs = node.getAbsolutePosition();
    const inv = layer?.getAbsoluteTransform().copy().invert();
    return inv ? inv.point(abs) : abs;
  }

  function exportNodeChanges(node: Konva.Node, before: Drawable | null) {
    if (!before) return null;

    const scaleX = (node as any).scaleX?.() ?? 1;
    const scaleY = (node as any).scaleY?.() ?? 1;
    const rotation = (node as any).rotation?.() ?? 0;

    const center = sceneToLayerPoint(node);

    if (before.type === "rect") {
      const w = (before.width ?? 0) * scaleX;
      const h = (before.height ?? 0) * scaleY;
      return {
        id: before.id,
        kind: "rect",
        x: center.x - w / 2,
        y: center.y - h / 2,
        width: w,
        height: h,
        rotation,
      } as ChangedShape;
    }

    if (before.type === "ellipse") {
      const w = (before.width ?? 0) * scaleX;
      const h = (before.height ?? 0) * scaleY;
      return {
        id: before.id,
        kind: "ellipse",
        x: center.x - w / 2,
        y: center.y - h / 2,
        width: w,
        height: h,
        rotation,
      } as ChangedShape;
    }

    if (before.type === "stroke") {
      const absTr = node.getAbsoluteTransform();
      const invLayer = node.getLayer()?.getAbsoluteTransform().copy().invert();
      const pts: number[] = [];
      for (let i = 0; i < before.points.length; i += 2) {
        const pScene = absTr.point({
          x: before.points[i],
          y: before.points[i + 1],
        });
        const pLayer = invLayer ? invLayer.point(pScene) : pScene;
        pts.push(pLayer.x, pLayer.y);
      }
      return { id: before.id, kind: "stroke", points: pts } as ChangedStroke;
    }

    if (before.type === "token") {
      const nx = (node as any).x?.() ?? 0;
      const ny = (node as any).y?.() ?? 0;
      const w = (node as any).width?.() ?? 0;
      const h = (node as any).height?.() ?? 0;

      const centerX = nx + w / 2;
      const centerY = ny + h / 2;

      const col = Math.max(
        0,
        Math.min(cols - 1, Math.floor(centerX / cellSize))
      );
      const row = Math.max(
        0,
        Math.min(rows - 1, Math.floor(centerY / cellSize))
      );

      (node as any).position({
        x: (col + 0.5) * cellSize - w / 2,
        y: (row + 0.5) * cellSize - h / 2,
      });

      return { id: before.id, kind: "token", col, row };
    }

    return null;
  }

  window.addEventListener("keydown", (e) => deleteToken(e));

  function deleteToken(e: KeyboardEvent) {
    if (e.code !== "Delete" || selectedId !== null) {
      publish(`/app/board.${boardId}.op`, {
        type: "token.delete",
        boardId,
        clientId,
        isGM,
        tokenId: selectedId,
      } as const);
    }
  }

  const commitSelection = useCallback(() => {
    if (!active) {
      lockCamera(false);
      return;
    }
    const id = selectedIdRef.current;
    if (!id) {
      lockCamera(false);
      return;
    }
    if (!canEdit(id)) {
      lockCamera(false);
      return;
    }

    const node = nodeRefs.current.get(id);
    const before = beforeRef.current;
    if (!node || !before) {
      lockCamera(false);
      return;
    }

    const ch = exportNodeChanges(node, before);
    beforeRef.current = null;

    if (!ch) {
      lockCamera(false);
      return;
    }

    if (ch.kind === "token") {
      publish(`/app/board.${boardId}.op`, {
        type: "token.move",
        boardId,
        clientId,
        isGM,
        id: ch.id,
        col: ch.col,
        row: ch.row,
        layerId: "tokens",
      } as const);

      lockCamera(false);
      return;
    }

    publish(`/app/board.${boardId}.op`, {
      type: "transform.apply",
      boardId,
      clientId,
      isGM,
      changed: [ch],
    } as const);

    lockCamera(false);
  }, [active, canEdit, publish, boardId, clientId, lockCamera]);

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
