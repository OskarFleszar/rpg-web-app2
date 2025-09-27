import { useCallback, useEffect, useState } from "react";
import "./Chat.css";
import { useChannel, usePublish } from "../../ws/hooks";
import axios from "axios";

type RollInfo = {
  rollType: string;
  rollFor: string;
  numberOfDice: number;
  bonus?: number;
  results?: number[];
  total?: number;
  outcome?: string;
  characterId?: number;
  clientId?: string;
};

type ChatEntryBase = {
  userId: number;
  nickname: string;
  timestamp: string;
  content: string;
};

type ChatMessage = ChatEntryBase & { type: "message" };
type DiceRoll = ChatEntryBase & { type: "roll"; roll: RollInfo };

type MessageItem = ChatMessage | DiceRoll;

type CharacterOption = {
  characterId: number;
  name: string;
};

type ChatProps = {
  campaignId?: string;
  characters?: CharacterOption[];
};

export function Chat({ campaignId, characters }: ChatProps) {
  const publish = usePublish();
  const handleIncoming = useCallback((msg: MessageItem) => {
    setMessages((prev) => [...prev, msg]);
  }, []);
  useChannel<MessageItem>(`/chatroom/${campaignId}`, (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [basicUserData, setBasicUserData] = useState({
    nickname: "",
    email: "",
    password: "",
  });
  const [rollData, setRollData] = useState({
    rollType: "d100",
    numberOfDice: 1,
    rollFor: "Other",
  });
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | "">(
    ""
  );

  useEffect(() => {
    loadBasicUserData();
    fetchChatHistory();
  }, [campaignId]);

  useEffect(() => {
    if (!characters || characters.length === 0) {
      setSelectedCharacterId("");
      console.log(characters);
      return;
    }
    setSelectedCharacterId(characters[0].characterId);
  }, [characters]);

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

  const sendMessage = () => {
    const content = newMessage.trim();
    if (!content) return;
    publish(`/app/message/${campaignId}`, { content }); // tylko content
    setNewMessage("");
  };

  const sendRoll = () => {
    if (selectedCharacterId === "") return;
    publish(`/app/roll/${campaignId}`, {
      rollType: rollData.rollType,
      rollFor: rollData.rollFor,
      numberOfDice: Number(rollData.numberOfDice),
      // bonus: ...
      characterId: Number(selectedCharacterId),
      // clientId: opcjonalnie, gdy chcesz optymistycznie wyświetlać i potem podmienić
    });
  };

  const handleRollDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRollData((prev) => ({
      ...prev,
      [name]: name === "numberOfDice" ? Number(value) : value,
    }));
  };

  return (
    <div className="chat-container">
      <div className="chat-messages-container">
        {messages.map((m, i) =>
          m.type === "message" ? (
            <div key={i} className="chat-message">
              <strong>{m.nickname}</strong>: {m.content}
              <span className="chat-ts">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ) : (
            <div key={i} className="chat-message roll">
              <strong>{m.nickname}</strong> rzuca {m.roll.numberOfDice}×
              {m.roll.rollType}
              {m.roll.rollFor ? ` dla ${m.roll.rollFor}` : ""}:{" "}
              {m.roll.results?.join(", ") ?? "…"}{" "}
              {typeof m.roll.total === "number"
                ? `(suma: ${m.roll.total})`
                : ""}
              <span className="chat-ts">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )
        )}
      </div>

      <div className="chat-input-section">
        <div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        <div>
          <select
            name="rollType"
            value={rollData.rollType}
            onChange={handleRollDataChange}
          >
            <option value="d4">d4</option>
            <option value="d6">d6</option>
            <option value="d8">d8</option>
            <option value="d10">d10</option>
            <option value="d12">d12</option>
            <option value="d20">d20</option>
            <option value="d100">d100</option>
          </select>
          <input
            onChange={handleRollDataChange}
            min={1}
            type="number"
            placeholder="Number Of Dice"
            value={rollData.numberOfDice}
            name="numberOfDice"
          />
          <select
            value={rollData.rollFor}
            onChange={handleRollDataChange}
            name="rollFor"
          >
            <option value="Disguise">Disguise</option>
            <option value="Command">Command</option>
            <option value="Gamble">Gamble</option>
            <option value="Ride">Ride</option>
            <option value="Consume Alcohol">Consume Alcohol</option>
            <option value="Animal Care">Animal Care</option>
            <option value="Gossip">Gossip</option>
            <option value="Swim">Swim</option>
            <option value="Drive">Drive</option>
            <option value="Charm">Charm</option>
            <option value="Search">Search</option>
            <option value="Silent Move">Silent Move</option>
            <option value="Perception">Perception</option>
            <option value="Outdoor Survival">Outdoor Survival</option>
            <option value="Haggle">Haggle</option>
            <option value="Concealment">Concealment</option>
            <option value="Row">Row</option>
            <option value="Scale Sheer Surface">Scale Sheer Surface</option>
            <option value="Evaluate">Evaluate</option>
            <option value="Intimidate">Intimidate</option>
            <option value="Other">Other</option>
          </select>
          {characters ? (
            <select
              name="character"
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(Number(e.target.value))}
            >
              {characters.map((c) => (
                <option key={c.characterId} value={c.characterId}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <></>
          )}
          <button onClick={sendRoll}>Roll</button>
        </div>
      </div>
    </div>
  );
}
