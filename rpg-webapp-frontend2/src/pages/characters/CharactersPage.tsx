import axios from "axios";
import { useEffect, useState } from "react";
import { CharacterCard } from "./CharacterCard";
import "./CharactersPage.css";
import { NavLink } from "react-router";

type CharacterBasic = {
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
      const response = await axios.get(
        "http://localhost:8080/api/character/basic",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCharacters(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Błąd przy pobieraniu postaci uzytkownika:", error);
    }
  };

  return (
    <div className="characters-page">
      {characters.map((character) => (
        <CharacterCard key={character.characterId} character={character} />
      ))}
      <NavLink to={"/characters/create"}>
        <button>Create Character</button>
      </NavLink>
    </div>
  );
}
