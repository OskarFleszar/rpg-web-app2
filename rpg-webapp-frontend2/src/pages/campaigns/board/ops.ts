export type StrokeStartOp = {
  type: "stroke.start";
  boardId: number;
  layerId: string;
  pathId: string; // UUID
  color: string;
  width: number;
};

export type StrokeAppendOp = {
  type: "stroke.append";
  boardId: number;
  pathId: string;
  points: number[][]; // [ [x,y], ... ]
};

export type StrokeEndOp = {
  type: "stroke.end";
  boardId: number;
  pathId: string;
};

export type ObjectRemoveOp = {
  type: "object.remove";
  boardId: number;
  objectId: string; // uuid
};

export type Snapshot = {
  version: number;
  layers: { id: string; objects: any[] }[];
};

export type BoardOp =
  | StrokeStartOp
  | StrokeAppendOp
  | StrokeEndOp
  | ObjectRemoveOp;
