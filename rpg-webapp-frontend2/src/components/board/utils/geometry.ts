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


export function circleHitsRectStroke(
  cx: number, cy: number, r: number,
  x: number,  y: number,  w: number, h: number,
  strokeWidth: number
): boolean {
  const hx = w / 2, hy = h / 2;                    
  const px = cx - (x + hx), py = cy - (y + hy);    
  const dx = Math.abs(px) - hx;
  const dy = Math.abs(py) - hy;

 
  const outsideX = Math.max(dx, 0);
  const outsideY = Math.max(dy, 0);
  const outsideDist = Math.hypot(outsideX, outsideY);
  const insideDist = Math.min(Math.max(dx, dy), 0);
  const sdf = outsideDist + insideDist;           

  const D = r + strokeWidth / 2;
  return Math.abs(sdf) <= D;                      
}


export function circleHitsEllipseStroke(
  cx: number, cy: number, r: number,
  ex: number, ey: number, w: number, h: number,
  strokeWidth: number
): boolean {
  const a = w / 2, b = h / 2;                 
  const dx = cx - (ex + a), dy = cy - (ey + b); 
  const D = r + strokeWidth / 2;             

 
  const tOuter = (dx*dx) / ((a + D)*(a + D)) + (dy*dy) / ((b + D)*(b + D));
  if (tOuter > 1) return false;              

  
  if (a - D <= 0 || b - D <= 0) return true;


  const tInner = (dx*dx) / ((a - D)*(a - D)) + (dy*dy) / ((b - D)*(b - D));
  return tInner >= 1;          
}              

