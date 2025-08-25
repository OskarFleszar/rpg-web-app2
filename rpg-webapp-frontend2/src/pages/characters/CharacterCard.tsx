import { Link } from "react-router";
import "./CharacterCard.css";

type CharacterCardProps = {
  character: {
    characterId: number;
    name: string;
    characterImage: string;
  };
};

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link
      to={`/characters/${character.characterId}`}
      className="character-link"
    >
      <div className="character-card">
        {character.characterImage ? (
          <img className="img" src={character.characterImage} alt="Profile" />
        ) : (
          <h3></h3>
        )}

        <p>{character.name}</p>
      </div>{" "}
    </Link>
  );
}
