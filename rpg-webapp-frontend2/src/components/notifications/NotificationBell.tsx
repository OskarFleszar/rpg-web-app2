/* eslint-disable @typescript-eslint/no-explicit-any */
// components/notifications/NotificationBell.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import "./Notifications.css";
import axios from "axios";

import { useNavigate } from "react-router";
import {
  useNotifications,
  type NotificationDTO,
} from "./hooks/useNotifications";
import { API_URL } from "../../config";

export function NotificationBell() {
  const [actingId, setActingId] = useState<number | null>(null);
  const [decision, setDecision] = useState<
    Record<number, "accepted" | "rejected">
  >({});

  const userId = Number(localStorage.getItem("userId"));
  const { items, unreadCount, markRead } = useNotifications(
    isNaN(userId) ? null : userId
  );
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handlePrimaryAction = useCallback(
    async (n: NotificationDTO) => {
      if (n.type === "NEW_SESSION_PROPOSED" || n.type === "SESSION_REMINDER") {
        const cid = (n.payload as any)?.campaignId;
        if (cid) nav(`/upcoming-sessions`);
        await markRead(n.id);
        setOpen(false);
      }
    },
    [markRead, nav]
  );

  const handleRejectInvite = (n: any) => {
    if (n.type !== "INVITED_TO_CAMPAIGN") return;
    setDecision((d) => ({ ...d, [n.id]: "rejected" }));
    markRead(n.id);
    setActingId(null);
  };

  const handleAcceptInvite = async (n: NotificationDTO) => {
    const cid = (n.payload as any)?.campaignId;
    const userId = Number(localStorage.getItem("userId"));
    try {
      setActingId(n.id);
      await axios.post(`${API_URL}/api/campaign/${cid}/accept`, userId, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setDecision((d) => ({ ...d, [n.id]: "accepted" }));
      await markRead(n.id);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="notif-bell-wrap" ref={boxRef}>
      <button
        className="notif-bell-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div role="dialog" aria-label="Notifications" className="notif-popup">
          {items.length === 0 ? (
            <div className="notif-empty">No notifications</div>
          ) : (
            items.slice(0, 12).map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.read ? "is-read" : ""}`}
              >
                <div className="notif-row">
                  <div className="notif-title">{n.title}</div>
                  {!n.read && <span className="notif-dot" />}
                </div>
                <div className="notif-body">{n.body}</div>
                <div className="notif-meta">
                  {new Date(n.createdAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>

                <div className="notif-actions">
                  {n.type === "INVITED_TO_CAMPAIGN" ? (
                    n.read || decision[n.id] ? (
                      <span className="notif-done">
                        {decision[n.id] === "accepted"
                          ? "accepted"
                          : decision[n.id] === "rejected"
                          ? "rejected"
                          : "handled"}
                      </span>
                    ) : (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleAcceptInvite(n)}
                          disabled={actingId === n.id}
                        >
                          {actingId === n.id ? "Working..." : "Accept"}
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleRejectInvite(n)}
                          disabled={actingId === n.id}
                        >
                          {actingId === n.id ? "Working..." : "Reject"}
                        </button>
                      </>
                    )
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePrimaryAction(n)}
                    >
                      View
                    </button>
                  )}

                  {!n.read && !decision[n.id] && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => markRead(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
