export function apiObjectToDrawable(o: any) {
  if (o.type === "stroke") {
    const pts = Array.isArray(o.points?.[0])
      ? (o.points as number[][]).flat()
      : (o.points as number[]) ?? [];
    return {
      type: "stroke" as const,
      id: o.objectId,
      points: pts,
      color: o.color,
      strokeWidth: o.width,
      ownerId: String(o.ownerId ?? ""),
    };
  }

  if (o.shape === "rect") {
    return {
      type: "rect" as const,
      id: o.objectId,
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
      rotation: o.rotation ?? 0,
      color: o.color,
      strokeWidth: o.strokeWidth ?? 1,
      ownerId: String(o.ownerId ?? ""),
    };
  }
  if (o.shape === "ellipse") {
    return {
      type: "ellipse" as const,
      id: o.objectId,
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
      rotation: o.rotation ?? 0,
      color: o.color,
      strokeWidth: o.strokeWidth ?? 1,
      ownerId: String(o.ownerId ?? ""),
    };
  }

  return null;
}
