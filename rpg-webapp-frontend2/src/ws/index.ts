import { createStompClient } from "./client";
import { WSBus } from "./bus";

export function createWSBus(baseUrl: string) {
  const client = createStompClient(baseUrl);
  return new WSBus(client);
}
