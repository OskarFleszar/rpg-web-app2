import axios from "axios";
import { useEffect, useState } from "react";
import "./GMPanel.css";
import { usePublish } from "../../ws/hooks";
import { API_URL } from "../../config";
import { GMPanelUserAdd } from "./gmpanelcomponents/GMPanelUserAdd";
import { GMPanelBoardpicker } from "./gmpanelcomponents/GMPanelBoardpicker";
import { GMPanelBoardAdd } from "./gmpanelcomponents/GMPanelBoardAdd";

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

export type BoardBasic = {
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

  const [isOpen, setIsOpen] = useState(false);

  const userId = localStorage.getItem("userId");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [boardBasicData, setBoardBasicData] = useState<BoardBasic[]>([]);

  useEffect(() => {
    if (!campaignId) return;

    publish(`/app/campaign.${campaignId}.op`, {
      type: "change.board",
      boardId,
      campaignId,
    } as const);
  }, [boardId, campaignId]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
    }
  };

  const handleUploadBackground = () => {
    if (selectedImageFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImageFile);
        axios.post(
          `${API_URL}/api/board/${boardId}/backgroundImage`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      } catch (error) {
        console.error("Error while uploading background image", error);
      }
    }
  };

  return (
    <div className={`GM-panel ${isOpen ? "open" : ""}`}>
      <div className={`GM-panel-tools ${isOpen ? "open" : ""}`}>
        <GMPanelUserAdd isGM={isGM} campaignId={campaignId} />

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

        <GMPanelBoardpicker
          boardId={boardId}
          setActiveBoardId={setActiveBoardId}
          gmBoardId={gmBoardId}
          setGmBoardId={setGmBoardId}
          boardBasicData={boardBasicData}
          setBoardBasicData={setBoardBasicData}
          campaignId={campaignId}
        />

        <GMPanelBoardAdd
          isGM={isGM}
          campaignId={campaignId}
          setboardBasicData={setBoardBasicData}
        />

        <div className="upload-save-background-div">
          <div>
            <label htmlFor="fileInput" className="gm-panel-button file-input">
              Choose Background
            </label>
            <input
              id="fileInput"
              type="file"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <button className="gm-panel-button" onClick={handleUploadBackground}>
            Save
          </button>
        </div>
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
