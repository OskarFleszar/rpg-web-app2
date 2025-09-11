import { useEffect } from "react";
import { useWS } from "./WSProvider";

export function useChannel<T = unknown>(
  destination: string,
  onMessage: (payload: T) => void
) {
  const ws = useWS();
  useEffect(() => {
    const unsub = ws.subscribe<T>(destination, (payload) => onMessage(payload));
    return () => unsub();
  }, [ws, destination, onMessage]);
}

export function usePublish() {
  const ws = useWS();
  return (destination: string, body: unknown) => ws.publish(destination, body);
}
