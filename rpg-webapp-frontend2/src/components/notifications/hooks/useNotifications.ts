// hooks/useNotifications.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useWS } from "../../../ws/WSProvider"; // Twój kontekst WS

export type NotificationType =
  | "NEW_SESSION_PROPOSED"
  | "INVITED_TO_CAMPAIGN"
  | "SESSION_REMINDER";

export type NotificationDTO = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  payload?: Record<string, unknown> | null;
  read: boolean;
  createdAt: string; // ISO
};

const API = "http://localhost:8080/api/notifications";

export function useNotifications(userId: number | null) {
  const ws = useWS();
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const token = localStorage.getItem("token");

  const auth = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [listRes, unreadRes] = await Promise.all([
      axios.get<NotificationDTO[]>(`${API}/${userId}`, auth),
      axios.get<number>(`${API}/${userId}/unread-count`, auth),
    ]);
    setItems(listRes.data);
    setUnreadCount(unreadRes.data);
  }, [userId, auth]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = ws.subscribe?.(
      "/user/queue/notifications",
      (msg: NotificationDTO) => {
        setItems((prev) => [msg, ...prev]);
        setUnreadCount((c) => c + (msg.read ? 0 : 1));
      }
    );
    return () => unsubscribe?.();
  }, [ws, userId]);

  const markRead = useCallback(
    async (id: number) => {
      if (!userId) return;
      await axios.post(`${API}/${userId}/${id}/read`, null, auth);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    [userId, auth]
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;

    await Promise.all(
      items
        .filter((n) => !n.read)
        .map((n) => axios.post(`${API}/${userId}/${n.id}/read`, null, auth))
    );
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [items, userId, auth]);

  return { items, unreadCount, markRead, markAllRead, refresh };
}
