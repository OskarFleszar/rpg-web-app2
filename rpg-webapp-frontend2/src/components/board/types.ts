export type Tool =
  | "hand"
  | "pencil"
  | "eraser"
  | "rect"
  | "ellipse"
  | "pointer"
  | "token"
  | "fog"
  | "fogcircle"
  | "fogsquare"
  | "fogpencil";

export type Stroke = {
  type: "stroke";
  id: string;
  points: number[];
  color: string;
  strokeWidth: number;
  ownerId: string;
};

export type FogPencilStroke = {
  type: "fogpencilstroke";
  id: string;
  points: number[];
  strokeWidth: number;
  ownerId: string;
};

export type Rect = {
  type: "rect";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color: string;
  strokeWidth: number;
  ownerId: string;
};

export type Ellipse = {
  type: "ellipse";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  color: string;
  strokeWidth: number;
  ownerId: string;
};

export type FogCircle = {
  type: "fogcircle";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;

  ownerId: string;
};

export type FogSquare = {
  type: "fogsquare";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ownerId: string;
};

export type Token = {
  type: "token";
  id: string;
  col: number;
  row: number;
  ownerId: string;
  characterId: number;
};

export type FogStroke = {
  type: "fog";
  id: string;
  points: number[];
  radius: number;
  ownerId: string;
};

export type Drawable =
  | Stroke
  | FogPencilStroke
  | Rect
  | Ellipse
  | Token
  | FogStroke
  | FogCircle
  | FogSquare;

export const isStroke = (o: Drawable): o is Stroke =>
  o.type === "stroke" || o.type === "fogpencilstroke";
export const isRect = (o: Drawable): o is Rect => o.type === "rect";
export const isEllipse = (o: Drawable): o is Ellipse => o.type === "ellipse";
export const isToken = (o: Drawable): o is Token => o.type === "token";
export const isFog = (o: Drawable): o is FogStroke => o.type === "fog";
