export type Tool = "hand" | "pencil" | "eraser" | "rect" | "ellipse";

export type Stroke = {
  type: "stroke";
  id: string;
  points: number[];
  color: string;
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
  color: string;
  strokeWidth: number;
  ownerId: string;
};

export type Drawable = Stroke | Rect | Ellipse;

export const isStroke = (o: Drawable): o is Stroke => o.type === "stroke";
export const isRect = (o: Drawable): o is Rect => o.type === "rect";
export const isEllipse = (o: Drawable): o is Ellipse => o.type === "ellipse";
