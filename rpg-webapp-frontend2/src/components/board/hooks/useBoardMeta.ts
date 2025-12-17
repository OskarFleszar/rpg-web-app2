import axios from "axios";
import { useEffect, type SetStateAction } from "react";
import { API_URL } from "../../../config";
import type { BoardMeta } from "../BoardCanvas";

export function useBoardMeta(
  boardId: number,
  setBoardMeta: React.Dispatch<React.SetStateAction<BoardMeta | null>>
) {
  const fetchBoardMeta = async () => {
    if (!boardId) return;

    const res = await axios.get(`${API_URL}/api/board/${boardId}/meta`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    setBoardMeta(res.data);
  };
  useEffect(() => {
    fetchBoardMeta();
  }, [boardId]);
}
