import  { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Characters.sass";

const CharacterSelectMenu = () => {
  const [characters, setCharacters] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

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

  const handleCharacterSelect = (character) => {
    localStorage.setItem("selectedCharacter", JSON.stringify(character));
    navigate(`/campaigns/${id}`);
  };

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
      <h2>Select a Character to Play</h2>
      <div className="characters-container">
        {characters.map((character) => (
          <div
            key={character.characterId}
            className="character-card"
            onClick={() => handleCharacterSelect(character)}
          >
            {character.imageUrl && (
              <img src={character.imageUrl} alt={`${character.name} avatar`} />
            )}
            <h3>{character.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelectMenu;
