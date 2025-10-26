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

export type EraseAppliedOp = {
  type: "erase.applied";
  boardId: number;
  clientId?: string;
  removed: { layerId: string; object: Rect | Ellipse | Stroke }[];
};

export type EraseUndoAppliedOp = {
  type: "erase.undo.applied";
  boardId: number;
  clientId?: string;
  restored: { layerId: string; object: Rect | Ellipse | Stroke }[];
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
  | EraseUndoAppliedOp;
