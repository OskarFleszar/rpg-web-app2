import axios from "axios";
import { useState } from "react";
import "./GMPanel.css";
import { usePublish } from "../ws/hooks";

type GMPanelProps = {
  campaignId?: string;
  isGM: boolean;
  boardId: number;
};

export function GMPanel({ campaignId, isGM, boardId }: GMPanelProps) {
  const publish = usePublish();
  const [addingUser, setAddingUser] = useState(false);
  const [nicknameToAdd, setNicknameToAdd] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const userId = localStorage.getItem("userId");

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
        <button
          onClick={() => {
            if (!confirm("Are you sure you want to clear the board?")) return;
            publish(`/app/board.${boardId}.op`, {
              type: "board.clearAll",
              boardId,
              userId,
            } as const);
          }}
          className="btn btn-danger"
          title="Clear the whole board"
        >
          Clear
        </button>
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
