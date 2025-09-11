import { useCallback, useState } from "react";
import "./Chat.css";
import { useChannel, usePublish } from "../../ws/hooks";

type ChatMessage = {
  message: string;
  userId: number;
  nickname: string;
  timestamp: string;
};

type ChatProps = {
  campaignId?: string; // jeśli może być undefined (np. z useParams)
};

export function Chat({ campaignId }: ChatProps) {
  const publish = usePublish();
  const handleIncoming = useCallback((msg: ChatMessage) => {
    // używamy funkcjonalnego setState, więc deps mogą być []
    setMessages((prev) => [...prev, msg]);
  }, []);
  useChannel<ChatMessage>(`/chatroom/${campaignId}`, handleIncoming);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const send = () => {
    const text = newMessage.trim();
    if (!text) return;
    publish(`/app/message/${campaignId}`, { text });
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-messages-container">
        {messages.map((m, i) => (
          <div key={i} className="chat-message">
            <strong>{m.nickname}</strong>: {m.message}
            <span className="chat-ts">
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <div className="chat-input-section">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
