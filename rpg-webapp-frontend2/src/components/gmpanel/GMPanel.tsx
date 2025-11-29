import axios from "axios";
import { useEffect, useState } from "react";
import "./GMPanel.css";
import { usePublish } from "../../ws/hooks";

type GMPanelProps = {
  campaignId?: string;
  isGM: boolean;
  boardId: number;
  GMRoll: boolean;
  setGMRoll: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveBoardId: React.Dispatch<React.SetStateAction<number | null>>;
  gmBoardId: number | null;
  setGmBoardId: React.Dispatch<React.SetStateAction<number | null>>;
  setShowCalendar: React.Dispatch<React.SetStateAction<boolean>>;
};

type BoardBasic = {
  id: number;
  name: string;
};

export function GMPanel({
  campaignId,
  isGM,
  boardId,
  GMRoll,
  setGMRoll,
  setActiveBoardId,
  gmBoardId,
  setGmBoardId,
  setShowCalendar,
}: GMPanelProps) {
  const publish = usePublish();
  const [addingUser, setAddingUser] = useState(false);
  const [nicknameToAdd, setNicknameToAdd] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [addingBoard, setAddingBoard] = useState(false);
  const [boardToAdd, setBoardToAdd] = useState("");
  const [boardBasicData, setboardBasicData] = useState<BoardBasic[]>([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    getBoardNames();
  }, []);

  useEffect(() => {
    if (!campaignId) return;

    publish(`/app/campaign.${campaignId}.op`, {
      type: "change.board",
      boardId,
      campaignId,
    } as const);
  }, [boardId, campaignId]);

  const getBoardNames = async () => {
    try {
      if (!isGM) return;
      const res = await axios.get(
        `http://localhost:8080/api/campaign/${campaignId}/getBoards`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(res.data);

      setboardBasicData(res.data);
    } catch (error) {
      console.error("An error occured while getting board names", error);
    }
  };

  const handleInviteUser = async () => {
    try {
      if (!isGM) return;
      await axios.post(
        `http://localhost:8080/api/campaign/${campaignId}/sendInvite`,
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

  const handleAddBoard = async () => {
    try {
      if (!isGM || !boardToAdd) return;
      console.log(boardToAdd);
      await axios.post(
        `http://localhost:8080/api/campaign/${campaignId}/addBoard`,
        { name: boardToAdd },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setBoardToAdd("");
      setAddingBoard(false);
      getBoardNames();
    } catch (error) {
      console.error("An error occured while adding board", error);
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
            <button className="confirm-button" onClick={handleInviteUser}>
              ✔️
            </button>
            <button onClick={() => setAddingUser(false)}>❌</button>
          </div>
        ) : (
          <button
            className="gm-panel-button"
            onClick={() => setAddingUser(true)}
          >
            👤➕
          </button>
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
          className="gm-panel-button"
          title="Clear the whole board"
        >
          Clear
        </button>
        <div className="gmroll">
          <span>GM Roll</span>
          <label className="checkbox-wrapper">
            <input
              className="character-select-checkbox"
              type="checkbox"
              checked={GMRoll}
              onChange={() => setGMRoll(!GMRoll)}
            />
            <span className="character-checkbox-custom" />
          </label>
        </div>

        <div className="board-picker">
          <p>Main board</p>
          <select
            value={boardId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setActiveBoardId(v === "" ? null : Number(v));

              console.log(boardId);
            }}
          >
            {boardBasicData.map((boardData) => (
              <option key={boardData.id} value={boardData.id}>
                {boardData.name}
              </option>
            ))}
          </select>
        </div>

        <div className="board-picker">
          <p>GM board</p>
          <select
            value={gmBoardId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setGmBoardId(v === "" ? null : Number(v));
            }}
          >
            {boardBasicData.map((boardData) => (
              <option key={boardData.id} value={boardData.id}>
                {boardData.name}
              </option>
            ))}
          </select>
        </div>

        {addingBoard ? (
          <div>
            <input
              type="text"
              placeholder="Board Name"
              value={boardToAdd}
              onChange={(e) => setBoardToAdd(e.target.value)}
            ></input>
            <button className="confirm-button" onClick={handleAddBoard}>
              ✔️
            </button>
            <button onClick={() => setAddingBoard(false)}>❌</button>
          </div>
        ) : (
          <button
            className="gm-panel-button"
            onClick={() => setAddingBoard(true)}
          >
            Add board
          </button>
        )}
        <button
          className="gm-panel-button"
          onClick={() => setShowCalendar((v) => !v)}
        >
          Calendar
        </button>
      </div>
      <button
        className="GM-panel-open-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "⮜" : "⮞"}
      </button>
    </div>
  );
}
