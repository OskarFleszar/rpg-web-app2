import React, { useState } from "react";
import type { Weapons } from "./CharacterPage";

type CharacterWeaponsProps = {
  weapons: Weapons[];
  setWeapons: React.Dispatch<React.SetStateAction<Weapons[]>>;
};

export function CharacterWeapons({
  weapons,
  setWeapons,
}: CharacterWeaponsProps) {
  const [newWeapon, setNewWeapon] = useState<Weapons>({
    name: "",
    category: "",
    strength: "",
    range: null,
    weaponAttributes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const { name, value } = e.target;
    setWeapons((prevWeapons) =>
      prevWeapons.map((weapon, i) =>
        i === idx ? { ...weapon, [name]: value } : weapon
      )
    );
  };

  const handleNewWeaponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setNewWeapon((prevWeapon) => ({
      ...prevWeapon,
      [name]: value,
    }));
  };

  const handleAddNewWeapon = () => {
    if (!newWeapon.name) {
      return;
    }
    setWeapons((prevWeapons) => [...prevWeapons, newWeapon]);
    setNewWeapon({
      name: "",
      category: "",
      strength: "",
      range: null,
      weaponAttributes: "",
    });
  };

  return (
    <div className="character-weapons-container">
      {weapons.map((weapon, idx) => {
        return (
          <div className="single-weapon-container" key={idx}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={weapon.name}
                name="name"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
            <div>
              <label>Category:</label>
              <input
                type="text"
                value={weapon.category}
                name="category"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
            <div>
              <label>Strength:</label>
              <input
                type="text"
                value={weapon.strength}
                name="strength"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
            <div>
              <label>Range:</label>
              <input
                type="number"
                value={weapon.range ?? ""}
                name="range"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
            <div>
              <label>Attributes:</label>
              <input
                type="text"
                value={weapon.weaponAttributes}
                name="weaponAttributes"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
          </div>
        );
      })}

      <div className="new-weapon-form">
        <input
          type="text"
          name="name"
          value={newWeapon.name}
          placeholder="Weapon Name"
          onChange={handleNewWeaponChange}
        />

        <input
          type="text"
          name="category"
          value={newWeapon.category}
          placeholder="Weapon Category"
          onChange={handleNewWeaponChange}
        />

        <input
          type="text"
          name="strength"
          value={newWeapon.strength}
          placeholder="Strength"
          onChange={handleNewWeaponChange}
        />

        <input
          type="number"
          name="range"
          value={newWeapon.range ?? ""}
          placeholder="Weapon Range"
          onChange={handleNewWeaponChange}
        />

        <input
          type="text"
          name="weaponAttributes"
          value={newWeapon.weaponAttributes}
          placeholder="Weapon Attributes"
          onChange={handleNewWeaponChange}
        />

        <button onClick={handleAddNewWeapon}>Add Weapon</button>
      </div>
    </div>
  );
}
