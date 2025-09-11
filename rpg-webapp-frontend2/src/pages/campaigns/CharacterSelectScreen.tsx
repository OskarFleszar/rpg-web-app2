import axios from "axios";
import { useEffect, useState } from "react";
import type { CharacterBasic } from "../characters/CharactersPage";
import { CharacterSelectCard } from "./CharacterSelectCard";
import "../characters/CharactersPage.css";
import { useNavigate, useParams } from "react-router";

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
      const response = await axios.get(
        "http://localhost:8080/api/character/basic",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCharacters(response.data);
    } catch (error) {
      console.error("Błąd przy pobieraniu postaci uzytkownika:", error);
    }
  };

  return (
    <div className="characters-page">
      {characters.map((character) => (
        <CharacterSelectCard
          key={character.characterId}
          character={character}
          setCharactersSelectedId={setCharactersSelectedId}
        />
      ))}
      <button
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
        onClick={() => {
          navigate(`/campaigns/${id}`);
          setCharactersSelectedId([]);
        }}
      >
        Skip
      </button>
    </div>
  );
}
