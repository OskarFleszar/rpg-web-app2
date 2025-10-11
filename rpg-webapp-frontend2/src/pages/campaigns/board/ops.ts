export type StrokeStartOp = {
  type: "stroke.start";
  boardId: number;
  layerId: string;
  pathId: string;
  color: string;
  width: number;
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
    }>;
  }>;
};

export type BoardOp =
  | StrokeStartOp
  | StrokeAppendOp
  | StrokeEndOp
  | ObjectRemoveOp;
