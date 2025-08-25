import { useState } from "react";

type CharacterWeaponsProps = {
  weapons: {
    name: string;
    category: string;
    strength: string;
    range: number;
    weaponAttributes: string;
    id: number | null;
  }[];
};

export function CharacterWeapons({ weapons }: CharacterWeaponsProps) {
  const [weaponsid] = useState(() => {
    return weapons.map((weapon) => ({ ...weapon, id: crypto.randomUUID() }));
  });
  return (
    <div className="character-weapons-container">
      {weaponsid.map((weapon) => {
        return (
          <div className="single-weapon-container" key={weapon.id}>
            <div>
              <label>Name:</label>
              <input type="text" value={weapon.name} name="name" />
            </div>
            <div>
              <label>Category:</label>
              <input type="text" value={weapon.category} name="category" />
            </div>
            <div>
              <label>Strength:</label>
              <input type="text" value={weapon.strength} name="strength" />
            </div>
            <div>
              <label>Range:</label>
              <input type="number" value={weapon.range} name="range" />
            </div>
            <div>
              <label>Attributes:</label>
              <input
                type="text"
                value={weapon.weaponAttributes}
                name="weaponAttributes"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
