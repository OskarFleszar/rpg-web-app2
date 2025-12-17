import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import "./CampaignPage.css";

import { Chat } from "../../components/chat/Chat";
import { WSProvider } from "../../ws/WSProvider";

import BoardCanvas from "../../components/board/BoardCanvas";
import { GMPanel } from "../../components/gmpanel/GMPanel";
import { CalendarComponent } from "../../components/calendar/Calendar";
import { API_URL } from "../../config";

export function CampaignPage() {
  const baseUrl = API_URL;
  const { id } = useParams();

  const { state } = useLocation();
  const characterIds = state?.characterIds as number[];
  const [isGM, setIsGM] = useState(false);
  const [GMRoll, setGMRoll] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [GMBoardId, setGMBoardId] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchiSGM();
    fetchActiveBoard();
  }, []);

  const fetchActiveBoard = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/campaign/${id}/activeBoard`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setActiveBoardId(response.data);
    } catch (error) {
      console.error("An error occured while fetching active board id", error);
    }
  };

  const fetchiSGM = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/campaign/${id}/GM`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data === Number(localStorage.getItem("userId")))
        setIsGM(true);

      console.log(
        `Backend gm: ${response.data}, localsotrage id: ${localStorage.getItem(
          "userId"
        )} ${isGM}`
      );
    } catch (error) {
      console.error("An error occured while fethcing gamemaster", error);
    }
  };

  return (
    <div className="campaign-page">
      <WSProvider baseUrl={baseUrl}>
        {isGM ? (
          <GMPanel
            campaignId={id}
            isGM={isGM}
            boardId={Number(activeBoardId)}
            GMRoll={GMRoll}
            setGMRoll={setGMRoll}
            setActiveBoardId={setActiveBoardId}
            gmBoardId={GMBoardId}
            setGmBoardId={setGMBoardId}
            setShowCalendar={setShowCalendar}
          />
        ) : (
          <></>
        )}

        <Chat
          campaignId={id}
          characterIds={characterIds}
          GMRoll={GMRoll}
          isGM={isGM}
        />
        <BoardCanvas
          boardId={Number(
            isGM && GMBoardId != null ? GMBoardId : activeBoardId
          )}
          isGM={isGM}
          setActiveBoardId={setActiveBoardId}
          campaignId={id}
        />
      </WSProvider>
      {showCalendar && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCalendar(false)} // klik w tło zamyka
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // żeby klik w kalendarz NIE zamykał
          >
            <button
              className="modal-close"
              onClick={() => setShowCalendar(false)}
            >
              ✕
            </button>
            <CalendarComponent campaignId={id} />
          </div>
        </div>
      )}
    </div>
  );
}
