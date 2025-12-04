/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import "./Chat.css";
import { useChannel, usePublish } from "../../ws/hooks";
import axios from "axios";
import { API_URL } from "../../config";

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
  GMRoll: boolean;
};

type ChatEntryBase = {
  userId: number;
  nickname: string;
  timestamp: string;
  content: string;
};

type SystemEntry = ChatEntryBase & { type: "system" };
type ChatMessage = ChatEntryBase & { type: "message" };
type DiceRoll = ChatEntryBase & { type: "roll"; roll: RollInfo };

type MessageItem = SystemEntry | ChatMessage | DiceRoll;

type CharacterOption = {
  characterId: number;
  name: string;
};

type ChatProps = {
  campaignId?: string;
  characters?: CharacterOption[];
  GMRoll: boolean;
  isGM: boolean;
};

export function Chat({ campaignId, characters, GMRoll, isGM }: ChatProps) {
  const publish = usePublish();
  useChannel<MessageItem>(`/chatroom/${campaignId}`, (msg) => {
    console.log(msg);
    setMessages((prev) => [...prev, msg]);
  });

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [rollData, setRollData] = useState({
    rollType: "d100",
    numberOfDice: 1,
    rollFor: "Other",
    bonus: 0,
  });
  const [selectedCharacterId, setSelectedCharacterId] = useState<
    number | "" | null
  >("");

  useEffect(() => {
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

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/${campaignId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

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
    if (selectedCharacterId === "") {
      setSelectedCharacterId(null);
    }
    publish(`/app/roll/${campaignId}`, {
      rollType: rollData.rollType,
      rollFor: rollData.rollFor,
      bonus: rollData.bonus,
      numberOfDice: Number(rollData.numberOfDice),
      characterId: Number(selectedCharacterId),
      GMRoll,
    });
    console.log({
      rollType: rollData.rollType,
      rollFor: rollData.rollFor,
      numberOfDice: Number(rollData.numberOfDice),
      characterId: Number(selectedCharacterId),
      GMRoll,
    });
  };

  const handleRollDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "bonus") {
      const num = Number(value);

      if (value === "") {
        setRollData((prev) => ({ ...prev, bonus: "" as any }));
        return;
      }

      const clamped = Math.max(-30, Math.min(30, num));

      setRollData((prev) => ({
        ...prev,
        bonus: clamped,
      }));
      return;
    }

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
          ) : m.type === "system" ? (
            <div key={i} className="chat-message system">
              <em>{m.content}</em>
            </div>
          ) : m.roll.GMRoll && !isGM ? (
            ""
          ) : (
            <div key={i} className="chat-message roll">
              <strong>{m.nickname}</strong> Rolled{" "}
              {m.roll.GMRoll ? "(GM) " : ""} {m.roll.numberOfDice}×
              {m.roll.rollType}
              {m.roll.rollFor ? ` for ${m.roll.rollFor}` : ""}:{" [ "}
              {m.roll.results?.join(", ") ?? "…"}
              {" ] "}
              {typeof m.roll.total === "number" ? (
                <span
                  style={{
                    color:
                      m.roll.outcome === "success"
                        ? "#00d100"
                        : m.roll.outcome === "failure"
                        ? "#ff2c2cff"
                        : "#f4efe4",
                  }}
                >{`( total: ${m.roll.total} )`}</span>
              ) : (
                ""
              )}
              <span className="chat-ts">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )
        )}
      </div>

      <div className="chat-input-section">
        <div className="message-send-row">
          <input
            type="text"
            value={newMessage}
            placeholder="Type in a message"
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        <div className="roll-controls-row">
          <div className="single-input-container">
            <p className="input-label">Dice type</p>
            <select
              name="rollType"
              value={rollData.rollFor !== "Other" ? "d100" : rollData.rollType}
              disabled={rollData.rollFor !== "Other"}
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
          </div>
          <div className="single-input-container">
            <p className="input-label">Number of dice</p>
            <input
              onChange={handleRollDataChange}
              min={1}
              type="number"
              placeholder="Number Of Dice"
              value={rollData.rollFor !== "Other" ? 1 : rollData.numberOfDice}
              disabled={rollData.rollFor !== "Other"}
              name="numberOfDice"
              className="number-of-dice-input"
            />
          </div>
          <div className="single-input-container">
            <p className="input-label">Roll For</p>
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
          </div>
          <div className="single-input-container">
            <p className="input-label">Character</p>
            {(characters?.length ?? 0) > 0 ? (
              <select
                name="character"
                value={selectedCharacterId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedCharacterId(v === "" ? null : Number(v));
                }}
              >
                <option value="">— no character —</option>
                {characters!.map((c) => (
                  <option key={c.characterId} value={c.characterId}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <select disabled>
                <option>No characters selected</option>
              </select>
            )}
          </div>

          <div className="single-input-container">
            <p className="input-label">Bonus</p>
            <input
              className="number-of-dice-input"
              type="number"
              name="bonus"
              value={rollData.bonus}
              min={-30}
              max={30}
              onChange={handleRollDataChange}
            />
          </div>

          <button className="roll-button" onClick={sendRoll}>
            Roll
          </button>
        </div>
      </div>
    </div>
  );
}
