import { useCallback, useEffect, useState } from "react";
import "./Chat.css";
import { useChannel, usePublish } from "../../ws/hooks";
import axios from "axios";

type ChatMessage = {
  content: string;
  userId: number;
  nickname: string;
  timestamp: string;
};

type ChatProps = {
  campaignId?: string;
};

export function Chat({ campaignId }: ChatProps) {
  const publish = usePublish();
  const handleIncoming = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);
  useChannel<ChatMessage>(`/chatroom/${campaignId}`, handleIncoming);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [basicUserData, setBasicUserData] = useState({
    nickname: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadBasicUserData();
    fetchChatHistory();
  }, []);

  const loadBasicUserData = async () => {
    const response = await axios.get(
      `http://localhost:8080/api/user/one/basic/${localStorage.getItem(
        "userId"
      )}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    setBasicUserData(response.data);
    console.log(response.data);
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/chat/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setMessages(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("An error occured while fetching chat history", error);
    }
  };

  const send = () => {
    const chatMessage = {
      content: newMessage.trim(),
      userId: localStorage.getItem("userId"),
      nickname: basicUserData.nickname,
      timestamp: new Date().toISOString(),
    };
    console.log(chatMessage);
    if (!chatMessage.content) return;
    publish(`/app/message/${campaignId}`, chatMessage);
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-messages-container">
        {messages.map((m, i) => (
          <div key={i} className="chat-message">
            <strong>{m.nickname}</strong>: {m.content}
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
