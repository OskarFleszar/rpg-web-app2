import axios from "axios";
import { useState } from "react";
import "./GMPanel.css";

type GMPanelProps = {
  campaignId?: string;
  isGM: boolean;
};

export function GMPanel({ campaignId, isGM }: GMPanelProps) {
  const [addingUser, setAddingUser] = useState(false);
  const [nicknameToAdd, setNicknameToAdd] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddUser = async () => {
    try {
      if (!isGM) return;
      await axios.post(
        `http://localhost:8080/api/campaign/${campaignId}/add`,
        { nickname: nicknameToAdd },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNicknameToAdd("");
      setAddingUser(false);
    } catch (error) {
      console.error("An error occured while adding user", error);
    }
  };
  return (
    <div className={`GM-panel ${isOpen ? "open" : ""}`}>
      <div className={`GM-panel-tools ${isOpen ? "open" : ""}`}>
        {addingUser ? (
          <div>
            <input
              type="text"
              placeholder="Nickname"
              value={nicknameToAdd}
              onChange={(e) => {
                setNicknameToAdd(e.target.value);
              }}
            />
            <button onClick={handleAddUser}>✔️</button>
            <button onClick={() => setAddingUser(false)}>❌</button>
          </div>
        ) : (
          <button onClick={() => setAddingUser(true)}>👤➕</button>
        )}
        <button>Clear</button>
      </div>
      <button
        className="GM-panel-open-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "<=" : "=>"}
      </button>
    </div>
  );
}
