import { createContext, useContext, useEffect, useMemo } from "react";
import { WSBus } from "./bus";
import { createWSBus } from ".";

type WSProviderProps = {
  baseUrl: string;
  children: React.ReactNode;
};

const WSContext = createContext<WSBus | null>(null);

export function WSProvider({ baseUrl, children }: WSProviderProps) {
  const bus = useMemo(() => createWSBus(baseUrl), [baseUrl]);

  useEffect(() => {
    bus.activate();
    return () => bus.deactivate();
  }, [bus]);

  return <WSContext.Provider value={bus}>{children}</WSContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWS() {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error("useWS must be used within WSProvider");
  return ctx;
}
