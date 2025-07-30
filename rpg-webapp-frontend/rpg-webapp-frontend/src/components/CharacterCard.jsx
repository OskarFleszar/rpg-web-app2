import { Link } from "react-router-dom";
import "../styles/CharacterCard.sass";

function CharacterCard({ character, imageUrl }) {
  return (
    <Link
      to={`/characters/${character.characterId}`}
      className="character-card"
    >
      {imageUrl ? (
        <img className="img" src={character.imageUrl} alt="Profile" />
      ) : (
        <h3></h3>
      )}

      <h3>{character.name}</h3>
    </Link>
  );
}

export default CharacterCard;
