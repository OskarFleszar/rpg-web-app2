import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import "./CampaignPage.css";

import { Chat } from "./Chat";
import { WSProvider } from "../../ws/WSProvider";
import BoardCanvas from "../../components/board/BoardCanvas";
import { GMPanel } from "../../components/GMPanel";

export function CampaignPage() {
  const baseUrl = "http://localhost:8080";
  const { id } = useParams();

  const [characters, setCharacters] = useState([]);
  const { state } = useLocation();
  const characterIds = state?.characterIds as number[];
  const [isGM, setIsGM] = useState(false);

  useEffect(() => {
    if (characterIds) {
      fetchCharactersData();
    }
    fetchiSGM();
  }, []);

  const fetchCharactersData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/character/chosencharacters",
        {
          params: { ids: characterIds.join(",") },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCharacters(response.data);
    } catch (error) {
      console.error("An error occured while fetching character data", error);
    }
  };

  const fetchiSGM = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/campaign/${id}/GM`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
          <GMPanel campaignId={id} isGM={isGM} boardId={Number(id)} />
        ) : (
          <></>
        )}

        <Chat campaignId={id} characters={characters} />
        <BoardCanvas boardId={Number(id)} />
      </WSProvider>
    </div>
  );
}
