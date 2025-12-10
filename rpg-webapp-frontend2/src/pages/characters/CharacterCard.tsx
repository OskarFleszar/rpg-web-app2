import { Link } from "react-router";
import "./CharacterCard.css";
import defaultPfp from "../../assets/images/braver-blank-pfp.jpg";

export type CharacterCardProps = {
  character: {
    characterId: number;
    name: string;
    characterImage?: string | null;
    imageType?: string | null;
  };
};

export const toImgSrc = (val?: string | null, mime = "image/jpeg") => {
  if (!val || val === "null" || val === "undefined" || val.trim() === "") {
    return defaultPfp;
  }
  if (
    val.startsWith("data:") ||
    val.startsWith("http") ||
    val.startsWith("blob:")
  ) {
    return val;
  }
  return `data:${mime};base64,${val}`;
};

export function CharacterCard({ character }: CharacterCardProps) {
  const imgSrc = toImgSrc(
    character.characterImage,
    character.imageType || undefined
  );

  const name = character.name || "Character Name";
  const len = name.length;

  const nameSizeClass =
    len > 40
      ? "name-xl"
      : len > 28
      ? "name-lg"
      : len > 20
      ? "name-md"
      : "name-sm";

  return (
    <Link
      to={`/characters/${character.characterId}`}
      className="character-link"
    >
      <div className="character-card">
        <div className="character-image-wrapper">
          <img
            className="character-image"
            src={imgSrc}
            alt={`${name} profile`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = defaultPfp;
            }}
          />
        </div>
        <p className={`character-name ${nameSizeClass}`}>{name}</p>
      </div>
    </Link>
  );
}
