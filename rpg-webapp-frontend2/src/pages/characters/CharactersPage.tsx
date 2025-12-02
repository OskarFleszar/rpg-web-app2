import axios from "axios";
import { useEffect, useState } from "react";
import { CharacterCard } from "./CharacterCard";
import "./CharactersPage.css";
import { NavLink } from "react-router";
import { BackgroundFog } from "../../styles/stypecomponents/BackgroundFog";
import { API_URL } from "../../config";

export type CharacterBasic = {
  characterId: number;
  name: string;
  characterImage: string;
  imageType: string;
};

export function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterBasic[]>([]);

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
            <CharacterCard key={character.characterId} character={character} />
          ))}
        </div>
        <NavLink to={"/characters/create"}>
          <button className="btn-primary create-character-btn">
            Create Character
          </button>
        </NavLink>
      </div>

      <BackgroundFog />
    </div>
  );
}
