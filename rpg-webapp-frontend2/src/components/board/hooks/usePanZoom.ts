import { useCallback, useRef, useState } from "react";
import type { KonvaEventObject } from "konva/lib/Node";


export function usePanZoom() {
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

 
  const [enabled, setEnabledState] = useState(true);
  const enabledRef = useRef(true);
  const setEnabled = useCallback((v: boolean) => {
    enabledRef.current = v;
    setEnabledState(v);
  }, []);

  const onWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.05;
      const oldScale = stageScale;
      const dir = e.evt.deltaY > 0 ? 1 : -1;
      const next = dir > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const newScale = Math.max(0.2, Math.min(5, next));

      const mousePointTo = {
        x: (pointer.x - stagePos.x) / oldScale,
        y: (pointer.y - stagePos.y) / oldScale,
      };

      setStageScale(newScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [stagePos, stageScale]
  );

  const onDragStart = useCallback(() => {
    if (!enabledRef.current) return; 
    setIsPanning(true);
  }, []);

  const onDragMove = useCallback((e: any) => {
    if (!enabledRef.current) return; 
    setStagePos(e.target.position());
  }, []);

  const onDragEnd = useCallback(() => {
    if (!enabledRef.current) return; 
    setIsPanning(false);
  }, []);

  return {
    stageScale,
    stagePos,
    isPanning,
    enabled,       
    setEnabled,     
    setStagePos,
    onWheel,
    onDragMove,
    onDragStart,
    onDragEnd,
  };
}
