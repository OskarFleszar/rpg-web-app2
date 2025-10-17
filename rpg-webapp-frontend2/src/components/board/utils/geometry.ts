export function distPointToSegment(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number
) {
  const dx = bx - ax,
    dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))
  );
  const qx = ax + t * dx,
    qy = ay + t * dy;
  return Math.hypot(px - qx, py - qy);
}
export function eraserHitsStroke(
  points: number[],
  x: number,
  y: number,
  r: number
) {
  if (points.length < 4) return false;
  for (let i = 2; i < points.length; i += 2) {
    if (
      distPointToSegment(
        points[i - 2],
        points[i - 1],
        points[i],
        points[i + 1],
        x,
        y
      ) <= r
    )
      return true;
  }
  return false;
}
