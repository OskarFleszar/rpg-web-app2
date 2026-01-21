import { useEffect, useState } from "react";

type StageSize = { width: number; height: number };

export function useStageSize(): StageSize {
  const get = () => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [size, setSize] = useState<StageSize>(get);

  useEffect(() => {
    const onResize = () => setSize(get());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}
