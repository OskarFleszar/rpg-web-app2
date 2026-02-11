/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Group, Layer, Stage, Transformer } from "react-konva";
import Konva from "konva";
import Toolbar from "./Toolbar";
import { usePanZoom } from "./hooks/usePanZoom";
import { useSnapshot } from "./hooks/useSnapshot";
import { useWsIncoming } from "./hooks/useWsIncoming";
import { usePencil } from "./hooks/usePencil";
import { useEraser } from "./hooks/useEraser";
import { type Tool, type Drawable } from "./types";
import { useUndo } from "./hooks/useUndo";
import { useShape } from "./hooks/useShape";
import { usePointer } from "./hooks/usePointer";
import { useBoardMeta } from "./hooks/useBoardMeta";
import { useToken } from "./hooks/useToken";

import { useBoardBackground } from "./hooks/useBoardBackground";
import { BoardBackground } from "./boardrendercomponents/BoardBackground";
import { Grid } from "./boardrendercomponents/Grid";
import { DrawingsLayer } from "./boardrendercomponents/DrawingsLayer";
import { TokenLayer } from "./boardrendercomponents/TokenLayer";
import { useStageSize } from "./hooks/useStageSize";
import { useToolHandlers } from "./hooks/useToolHandlers";
import { useSelectableProps } from "./hooks/useSelectableProps";
import { FogOfWarLayer } from "./boardrendercomponents/FogOfWarLayer";

type Props = {
  boardId: number;
  isGM: boolean;
  setActiveBoardId: React.Dispatch<React.SetStateAction<number | null>>;
  campaignId: string | undefined;
  selectedCharacterId: number | "" | null;
  fogOfWarOn: boolean;
  setFogOfWarOn: React.Dispatch<React.SetStateAction<boolean>>;
};

type PushUndo = (
  a:
    | { kind: "draw"; objectId: string }
    | { kind: "erase"; objectIds: string[] },
) => void;

export type BoardMeta = {
  cols: number;
  rows: number;
  cellSize: number;
};

export default function BoardCanvas({
  boardId,
  isGM,
  setActiveBoardId,
  campaignId,
  selectedCharacterId,
  fogOfWarOn,
  setFogOfWarOn,
}: Props) {
  const [boardMeta, setBoardMeta] = useState<BoardMeta | null>(null);

  const meta = boardMeta ?? { cols: 20, rows: 20, cellSize: 80 };

  const selectedCharacterIdNum =
    typeof selectedCharacterId === "number" ? selectedCharacterId : null;

  useBoardMeta(boardId, setBoardMeta);

  const boardWidth = meta.cols * meta.cellSize;
  const boardHeight = meta.rows * meta.cellSize;

  const isInsideBoard = (pt: { x: number; y: number }) =>
    pt.x >= 0 && pt.y >= 0 && pt.x <= boardWidth && pt.y <= boardHeight;

  const size = useStageSize();

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
      return !!o && o.ownerId === currentUserId;
    },
    [currentUserId],
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
    setStagePos,
    isPanning,
    onWheel,
    onDragMove,
    onDragStart,
    onDragEnd,
    enabled,
    setEnabled,
  } = usePanZoom();

  useEffect(() => {
    setStagePos({
      x: (size.width - boardWidth * stageScale) / 2,
      y: (size.height - boardHeight * stageScale) / 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

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
    [],
  );

  const pointer = usePointer({
    active: tool === "pointer",
    boardId,
    clientId,
    objects,
    setObjects,
    currentUserId,
    isGM,
    layerRef,
    setPanZoomEnabled: setEnabled,
    boardMeta: meta,
  });

  const token = useToken({
    active: tool === "token",
    boardId,
    stageRef,
    layerRef,
    clientId,
    currentUserId,
    setObjects,
    boardMeta: meta,
    layerId: "tokens",
    characterId: selectedCharacterIdNum,
  });

  const { addMyPath, removeMyPath, markPendingRemoval, pendingRemoval } =
    useWsIncoming(
      boardId,
      setObjects,
      clientId,
      setActiveBoardId,
      campaignId,
      fogOfWarOn,
      setFogOfWarOn,
      {
        pushUndo: (a) => pushUndoRef.current?.(a),
        shouldIgnoreEraseApplied: (ids) =>
          !!shouldIgnoreEraseAppliedRef.current?.(ids),
        OnBoardCleared: () => pointer.clearSelection(),
      },
    );

  const { pushUndo, shouldIgnoreEraseApplied } = useUndo({
    boardId,
    clientId,
    objects,
    markPendingRemoval,
    isGM,
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
    isGM,
  });

  const background = useBoardBackground(boardId);

  useEffect(() => {
    if (tool !== "pointer") pointer.clearSelection();
  }, [tool]);

  const { onPointerDown, onPointerMove, onPointerUp, pointerOnLayer } =
    useToolHandlers({
      tool,
      stageRef,
      layerRef,
      isInsideBoard,
      pencil,
      shapes,
      token,
      pointer,
      eraser: { onDown: erDown, onMove: erMove, onUp: erUp },
    });

  const selectableProps = useSelectableProps({ tool, isGM, isMine, pointer });

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

      {!boardMeta ? (
        <div>Loading...</div>
      ) : (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
          draggable={tool === "hand" && enabled}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ cursor, background: "#919191ff" }}
        >
          <Layer ref={layerRef}>
            <Group
              clipX={0}
              clipY={0}
              clipWidth={boardWidth}
              clipHeight={boardHeight}
            >
              <BoardBackground
                background={background}
                boardWidth={boardWidth}
                boardHeight={boardHeight}
              />

              <Grid
                meta={meta}
                boardWidth={boardWidth}
                boardHeight={boardHeight}
              />

              <DrawingsLayer
                objects={objects}
                selectableProps={selectableProps}
                isMine={isMine}
                erasePreview={erasePreview}
                pendingRemoval={pendingRemoval}
              />

              <FogOfWarLayer
                fogOfWarOn={fogOfWarOn}
                boardWidth={boardWidth}
                boardHeight={boardHeight}
                isGM={isGM}
              />

              <TokenLayer
                objects={objects}
                boardMeta={boardMeta}
                selectableProps={selectableProps}
              />
            </Group>

            <Transformer
              ref={pointer.trRef}
              rotateEnabled
              enabledAnchors={[
                "top-left",
                "top-center",
                "top-right",
                "middle-left",
                "middle-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
              ]}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
              }
            />

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
      )}
    </div>
  );
}
