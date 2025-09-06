import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function CampaignPage() {
  const [characters, setCharacters] = useState();
  const { state } = useLocation();
  const characterIds = (state?.characterIds as number[]) ?? [];

  useEffect(() => {
    console.log(characterIds);
    fetchCharactersData();
  }, []);

  const fetchCharactersData = async () => {
    const response = await axios.get(
      "http://localhost:8080/api/character/chosencharacters",
      {
        params: { ids: characterIds.join(",") },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    console.log(response.data);
    setCharacters(response.data);
  };
  return <div></div>;
}
