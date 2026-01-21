import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../../config";
import axios from "axios";
import type { CharacterImageDTO } from "../../../pages/characters/CharacterPage";
import { toImgSrcBackground } from "../utils/images";
import useImage from "use-image";

export function useBoardBackground(boardId: number) {
  const [boardImageRaw, setBoardImageRaw] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<CharacterImageDTO>(
          `${API_URL}/api/board/${boardId}/backgroundImage`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        setBoardImageRaw(response.data?.characterImage ?? null);
        setImageType(response.data?.imageType ?? null);
      } catch (error) {
        console.error("Error fetching board image:", error);
        setBoardImageRaw(null);
        setImageType(null);
      }
    })();
  }, [boardId]);

  const imgSrc = useMemo(
    () => toImgSrcBackground(boardImageRaw, imageType || undefined) ?? "",
    [boardImageRaw, imageType],
  );

  const [bgImg] = useImage(imgSrc, "anonymous");

  return bgImg;
}
