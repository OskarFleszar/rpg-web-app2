import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { fetchBoardNames } from "../boardApi";
import type { BoardBasic } from "../GMPanel";

type BoardMeta = {
  name: string;
  cols: number;
  rows: number;
};

type GMPanelUserAddProps = {
  isGM: boolean;
  campaignId: string | undefined;
  setboardBasicData: React.Dispatch<React.SetStateAction<BoardBasic[]>>;
};

export function GMPanelBoardAdd({
  isGM,
  campaignId,
  setboardBasicData,
}: GMPanelUserAddProps) {
  const [addingBoard, setAddingBoard] = useState(false);
  const [boardToAdd, setBoardToAdd] = useState<BoardMeta>({
    name: "",
    cols: 0,
    rows: 0,
  });

  const handleChangeBordData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoardToAdd((prevBoardData) => ({ ...prevBoardData, [name]: value }));
  };

  const handleAddBoard = async () => {
    try {
      if (!isGM || !boardToAdd || !campaignId) return;

      await axios.post(
        `${API_URL}/api/campaign/${campaignId}/addBoard`,
        {
          name: boardToAdd.name,
          cols: Number(boardToAdd.cols),
          rows: Number(boardToAdd.rows),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setBoardToAdd({ name: "", cols: 0, rows: 0 });
      setAddingBoard(false);
      const data = await fetchBoardNames(campaignId);
      setboardBasicData(data);
    } catch (error) {
      console.error("An error occured while adding board", error);
    }
  };

  return (
    <>
      {addingBoard ? (
        <div className="add-board-inputs">
          <div>
            <p className="input-label">Rows</p>
            <input
              type="number"
              name="rows"
              placeholder="Board Rows"
              value={boardToAdd.rows}
              onChange={(e) => handleChangeBordData(e)}
            ></input>
          </div>
          <div>
            <p className="input-label">Columns</p>
            <input
              type="number"
              name="cols"
              placeholder="Board cols"
              value={boardToAdd.cols}
              onChange={(e) => handleChangeBordData(e)}
            ></input>
          </div>
          <input
            type="text"
            name="name"
            placeholder="Board Name"
            value={boardToAdd.name}
            onChange={(e) => handleChangeBordData(e)}
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
    </>
  );
}
