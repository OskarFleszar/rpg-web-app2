import axios from "axios";
import { useEffect, useState } from "react";
import type { CharacterBasic } from "../characters/CharactersPage";
import { CharacterSelectCard } from "./CharacterSelectCard";
import "../characters/CharactersPage.css";
import { useNavigate, useParams } from "react-router";
import { BackgroundFog } from "../../styles/stypecomponents/BackgroundFog";
import { API_URL } from "../../config";

export function CharacterSelectScreen() {
  const { id } = useParams();
  const [characters, setCharacters] = useState<CharacterBasic[]>([]);
  const [charactersSelectedId, setCharactersSelectedId] = useState<number[]>(
    []
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchBasicCharacterData();
  }, []);

  const fetchBasicCharacterData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/character/basic`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCharacters(response.data);
    } catch (error) {
      console.error("Błąd przy pobieraniu postaci uzytkownika:", error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="characters-page">
        <div className="charater-cards-grid">
          {characters.map((character) => (
            <CharacterSelectCard
              key={character.characterId}
              character={character}
              setCharactersSelectedId={setCharactersSelectedId}
            />
          ))}
        </div>
        <button
          className="btn-primary create-character-btn confirm-btn"
          onClick={() => {
            navigate(`/campaigns/${id}`, {
              state: { characterIds: charactersSelectedId },
            });
            setCharactersSelectedId([]);
          }}
        >
          Confirm
        </button>
        <button
          className="btn-secondary create-character-btn "
          onClick={() => {
            navigate(`/campaigns/${id}`);
            setCharactersSelectedId([]);
          }}
        >
          Skip
        </button>
      </div>

      <BackgroundFog />
    </div>
  );
}
