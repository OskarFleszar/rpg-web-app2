import { useState, useEffect } from "react";
import axios from "axios";
import CharacterCard from "../components/CharacterCard";
import { Link } from "react-router-dom";
import "../styles/Characters.sass";

function Characters() {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/character",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const charactersWithImages = await Promise.all(
          response.data.map(async (character) => {
            const imageUrl = await fetchCharacterImage(character.characterId);
            return { ...character, imageUrl };
          })
        );

        setCharacters(charactersWithImages);
      } catch (error) {
        console.error("Error fetching characters:", error);
      }
    };

    fetchCharacters();
  }, []);

  const fetchCharacterImage = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/character/characterImage/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "arraybuffer",
        }
      );

      const base64Image = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      return `data:image/jpeg;base64,${base64Image}`;
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęcia postaci:", error);
      return null;
    }
  };

  return (
    <div className="characters-list">
      <h2>Your Characters</h2>
      <div className="characters-container">
        {characters.map((character) => (
          <CharacterCard
            key={character.characterId}
            character={character}
            imageUrl={character.imageUrl}
          />
        ))}
      </div>
      <Link to="/character-creator">
        <button>Create a new character</button>
      </Link>
    </div>
  );
}

export default Characters;
