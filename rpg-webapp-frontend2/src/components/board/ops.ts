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
    objects: Array<{
      type: "stroke";
      objectId: string;
      pathId: string;
      color: string;
      width: number;
      points: number[][];
      ownerId: number;
    }>;
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

export type BoardOp =
  | StrokeStartOp
  | StrokeAppendOp
  | StrokeEndOp
  | ObjectRemoveOp
  | ObjectsRemovedOp
  | EraseStartOp
  | EraseAppendOp
  | EraseEndOp;
