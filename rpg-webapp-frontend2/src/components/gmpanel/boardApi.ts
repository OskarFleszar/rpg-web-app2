import axios from "axios";
import { API_URL } from "../../config";
import type { BoardBasic } from "./GMPanel";

export async function fetchBoardNames(
  campaignId?: string,
): Promise<BoardBasic[]> {
  if (!campaignId) return [];
  const res = await axios.get<BoardBasic[]>(
    `${API_URL}/api/campaign/${campaignId}/getBoards`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
  );
  return res.data;
}
