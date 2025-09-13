// ws/bus.ts
import {
  Client,
  type IMessage,
  type StompSubscription,
  type IFrame,
} from "@stomp/stompjs";

export class WSBus {
  private client: Client;
  private subs: StompSubscription[] = [];

  private pendingSubs: Array<() => void> = [];
  private pendingPublishes: Array<{ destination: string; body: string }> = [];
  private connected = false;

  constructor(client: Client) {
    this.client = client;

    const prevOnConnect = this.client.onConnect;
    const prevOnDisconnect = this.client.onDisconnect;

    this.client.onConnect = (frame: IFrame) => {
      this.connected = true;

      const toRun = this.pendingSubs.splice(0);
      toRun.forEach((fn) => fn());

      const toSend = this.pendingPublishes.splice(0);
      toSend.forEach(({ destination, body }) => {
        this.client.publish({ destination, body });
      });

      prevOnConnect?.(frame);
    };

    this.client.onDisconnect = (frame: IFrame) => {
      this.connected = false;
      prevOnDisconnect?.(frame);
    };
  }

  activate() {
    this.client.activate();
  }

  deactivate() {
    for (const sub of this.subs) {
      try {
        sub.unsubscribe();
      } catch (err) {
        if (typeof console !== "undefined") {
          console.debug("[WSBus] unsubscribe failed (ignored)", err);
        }
      }
    }
    this.subs = [];
    void this.client.deactivate();
  }

  isConnected() {
    return this.connected;
  }

  subscribe<T = unknown>(
    destination: string,
    handler: (payload: T, raw: IMessage) => void
  ) {
    let cancelled = false;
    let stompSub: StompSubscription | null = null;

    const doSubscribe = () => {
      if (cancelled) return;
      const sub = this.client.subscribe(destination, (msg) => {
        let parsed: unknown = msg.body;
        try {
          parsed = JSON.parse(msg.body);
        } catch {
          void 0;
        }
        handler(parsed as T, msg);
      });
      this.subs.push(sub);
      stompSub = sub;
    };

    if (this.connected) {
      doSubscribe();
    } else {
      this.pendingSubs.push(doSubscribe);
    }
    return () => {
      cancelled = true;
      if (stompSub) {
        try {
          stompSub.unsubscribe();
        } catch (err) {
          if (typeof console !== "undefined") {
            console.debug("[WSBus] unsubscribe failed (ignored)", err);
          }
        }
        this.subs = this.subs.filter((s) => s !== stompSub);
      } else {
        this.pendingSubs = this.pendingSubs.filter((fn) => fn !== doSubscribe);
      }
    };
  }

  publish(destination: string, body: unknown) {
    const payload = typeof body === "string" ? body : JSON.stringify(body);
    if (this.connected) {
      this.client.publish({ destination, body: payload });
    } else {
      this.pendingPublishes.push({ destination, body: payload });
    }
  }
}
