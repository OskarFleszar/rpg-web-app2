import { toImgSrc, type CharacterCardProps } from "../characters/CharacterCard";
import defaultPfp from "../../assets/images/braver-blank-pfp.jpg";
import "../characters/CharacterCard.css";
import type React from "react";

type Character = CharacterCardProps["character"];

type CharacterSelectCardProps = {
  character: Character;
  setCharactersSelectedId: React.Dispatch<React.SetStateAction<number[]>>;
};

export function CharacterSelectCard({
  character,
  setCharactersSelectedId,
}: CharacterSelectCardProps) {
  const imgSrc = toImgSrc(
    character.characterImage,
    character.imageType || undefined
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCharactersSelectedId((prev) =>
      e.target.checked
        ? [...prev, character.characterId]
        : prev.filter((id) => id !== character.characterId)
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
    <label htmlFor={String(character.characterId)}>
      <div className="character-link">
        <div className="character-card select">
          <div className="character-image-wrapper">
            <img
              className="character-image"
              src={imgSrc}
              alt={`${character.name} profile`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = defaultPfp;
              }}
            />
          </div>
          <p className={`character-name ${nameSizeClass}`}>
            {name || "Character Name"}
          </p>
          <label className="character-checkbox-wrapper">
            <input
              id={String(character.characterId)}
              type="checkbox"
              className="character-select-checkbox"
              onChange={handleChange}
            />
            <span className="character-checkbox-custom" />
          </label>
        </div>
      </div>
    </label>
  );
}
