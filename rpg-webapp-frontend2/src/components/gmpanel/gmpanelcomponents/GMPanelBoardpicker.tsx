/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import type { BoardBasic } from "../GMPanel";
import { fetchBoardNames } from "../boardApi";

type GMPanelBoardPickerProps = {
  boardId: number;
  setActiveBoardId: React.Dispatch<React.SetStateAction<number | null>>;
  gmBoardId: number | null;
  setGmBoardId: React.Dispatch<React.SetStateAction<number | null>>;
  boardBasicData: BoardBasic[];
  setBoardBasicData: React.Dispatch<React.SetStateAction<BoardBasic[]>>;
  campaignId: string | undefined;
};

export function GMPanelBoardpicker({
  boardId,
  setActiveBoardId,
  gmBoardId,
  setGmBoardId,
  boardBasicData,
  setBoardBasicData,
  campaignId,
}: GMPanelBoardPickerProps) {
  const getBoardNames = async () => {
    const data = await fetchBoardNames(campaignId);
    setBoardBasicData(data);
  };

  useEffect(() => {
    if (!campaignId) return;
    getBoardNames();
  }, [campaignId]);

  return (
    <>
      <div className="board-picker">
        <p>Main board</p>
        <select
          value={boardId ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setActiveBoardId(v === "" ? null : Number(v));
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
    </>
  );
}
