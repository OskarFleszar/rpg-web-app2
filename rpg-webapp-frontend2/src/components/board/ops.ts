import type { Ellipse, Rect, Stroke } from "./types";

export type StrokeStartOp = {
  type: "stroke.start";
  boardId: number;
  layerId: string;
  pathId: string;
  color: string;
  width: number;
  ownerId: string;
  clientId?: string;
};

export type StrokeAppendOp = {
  type: "stroke.append";
  boardId: number;
  pathId: string;
  points: number[][];
  clientId?: string;
};

export type StrokeEndOp = {
  type: "stroke.end";
  boardId: number;
  pathId: string;
  clientId?: string;
};

export type ObjectRemoveOp = {
  type: "object.remove";
  boardId: number;
  objectId: string;
  clientId?: string;
};

export type Snapshot = {
  version: number;
  layers: Array<{
    id: string;
    objects: Array<
      | {
          type: "stroke";
          objectId: string;
          pathId: string;
          color: string;
          width: number;
          points: number[][];
          ownerId: number;
        }
      | Rect
      | Ellipse
    >;
  }>;
};

export type EraseStartOp = {
  type: "erase.start";
  boardId: number;
  layerId: string;
  eraseId: string;
  radius: number;
  clientId?: string;
};

export type EraseAppendOp = {
  type: "erase.append";
  boardId: number;
  eraseId: string;
  points: number[][];
  clientId?: string;
};

export type EraseEndOp = {
  type: "erase.end";
  boardId: number;
  eraseId: string;
  clientId?: string;
};

export type ObjectsRemovedOp = {
  type: "objects.removed";
  boardId: number;
  objectIds: string[];
  clientId?: string;
};

export type RectShape = {
  type: "rect";
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  width: number;
  ownerId: string;
};
export type CircleShape = {
  type: "circle";
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  width: number;
  ownerId: string;
};
export type ShapePayload = RectShape | CircleShape;

export type ShapeAddOp = {
  type: "shape.add";
  boardId: number;
  layerId: string;
  shape: Rect | Ellipse;
  clientId?: string;
};

export type TokenAddOp = {
  type: "token.add";
  id: string;
  boardId: number;
  layerId: string;
  col: number;
  row: number;
  characterId: number;
  clientId?: string;
};

export type TokenMoveOp = {
  type: "token.moved";
  id: string;
  col: number;
  row: number;
};

export type TokenDeleteOp = {
  type: "token.deleted";
  id: string;
};

export type EraseAppliedOp = {
  type: "erase.applied";
  boardId: number;
  clientId?: string;
  removed: { layerId: string; object: Rect | Ellipse | Stroke }[];
};

export type BoardClearedOp = {
  type: "board.cleared";
  boardId: number;
  clientId?: string;
};

export type EraseUndoAppliedOp = {
  type: "erase.undo.applied";
  boardId: number;
  clientId?: string;
  restored: { layerId: string; object: Rect | Ellipse | Stroke }[];
};

export type TransformChangedStroke = {
  id: string;
  kind: "stroke";
  points: number[];
};

export type TransformChangedShape = {
  id: string;
  kind: "rect" | "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number | null;
};

export type TransformAppliedOp = {
  type: "transform.applied";
  boardId: number;
  changed: (TransformChangedStroke | TransformChangedShape)[];
  clientId?: string;
};

export type TransformApplyOp = {
  type: "transform.apply";
  boardId: number;
  clientId: string;
  changed: (TransformChangedStroke | TransformChangedShape)[];
};

export type ChangeBoardOp = {
  type: "change-board";
  boardId: number;
  campaignId: number;
};

export type FogOffOnOp = {
  type: "fog.on.off";
  boardId: number;
  clientId?: string;
};

export type FogLineErased = {
  type: "fog.line.erased";
  pathId: string;
  boardId: number;
  radius: number;
  points: number[][];
  clientId?: string;
};
export type BoardOp =
  | StrokeStartOp
  | StrokeAppendOp
  | StrokeEndOp
  | ObjectRemoveOp
  | ObjectsRemovedOp
  | EraseStartOp
  | EraseAppendOp
  | EraseEndOp
  | ShapeAddOp
  | EraseAppliedOp
  | EraseUndoAppliedOp
  | BoardClearedOp
  | TransformAppliedOp
  | ChangeBoardOp
  | TokenAddOp
  | TokenMoveOp
  | TokenDeleteOp
  | FogOffOnOp
  | FogLineErased;
