export type Tool = "hand" | "pencil" | "eraser";

export type Stroke = {
  id: string;
  points: number[];
  color: string;
  width: number;
};
