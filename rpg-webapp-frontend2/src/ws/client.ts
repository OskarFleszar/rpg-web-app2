import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function createStompClient(baseUrl: string) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
    },
    reconnectDelay: 1000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    //debug: (s) => console.log("[STOMP DEBUG]", s)
  });

  client.onConnect = (frame) => {
    console.log("[STOMP] connected", frame.headers);
  };

  client.onStompError = (frame) => {
    console.error(
      "[STOMP] broker error: ",
      frame.headers["message"],
      frame.body
    );
  };

  client.onWebSocketError = (event) => {
    console.error("[STOMP] websocket error", event);
  };

  client.onDisconnect = () => {
    console.log("[STOMP] disconnected");
  };

  return client;
}
