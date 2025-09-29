import { useEffect, useRef } from "react";
import { useWS } from "./WSProvider";

export function useChannel<T = unknown>(
  destination: string | undefined,
  onMessage: (payload: T) => void
) {
  const ws = useWS();

  // aktualny handler w ref – nie powoduje resubskrypcji
  const handlerRef = useRef(onMessage);
  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!destination) return;

    const unsub = ws.subscribe<T>(destination, (payload) => {
      handlerRef.current(payload);
    });

    return () => {
      try {
        unsub();
      } catch (error) {
        console.error("Error while unsubing", error);
      }
    };
  }, [ws, destination]); // <- tylko te dwie zależności
}

export function usePublish() {
  const ws = useWS();
  return (destination: string, body: unknown) => ws.publish(destination, body);
}
