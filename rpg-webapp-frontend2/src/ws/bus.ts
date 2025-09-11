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

  // kolejki do odpalenia po połączeniu
  private pendingSubs: Array<() => void> = [];
  private pendingPublishes: Array<{ destination: string; body: string }> = [];
  private connected = false;

  constructor(client: Client) {
    this.client = client;

    // zachowaj ewentualne istniejące hooki
    const prevOnConnect = this.client.onConnect;
    const prevOnDisconnect = this.client.onDisconnect;

    this.client.onConnect = (frame: IFrame) => {
      this.connected = true;

      // flush subskrypcji
      const toRun = this.pendingSubs.splice(0);
      toRun.forEach((fn) => fn());

      // flush publikacji
      const toSend = this.pendingPublishes.splice(0);
      toSend.forEach(({ destination, body }) => {
        this.client.publish({ destination, body });
      });

      prevOnConnect?.(frame);
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      prevOnDisconnect?.();
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
    // nie awaitujemy w cleanupie
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
          /* tekst / nie-JSON */
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

    // zwracamy bezpieczne unsubscribe (działa nawet zanim połączenie powstanie)
    return () => {
      cancelled = true;
      if (stompSub) {
        try {
          stompSub.unsubscribe();
        } catch {}
        this.subs = this.subs.filter((s) => s !== stompSub);
      } else {
        // jeszcze nie zasubskrybowane -> usuń z kolejki
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
