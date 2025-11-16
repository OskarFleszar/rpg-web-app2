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
      <div className="section-title">Weapons</div>
      <div className="weapons-grid">
        {weapons.map((weapon, idx) => {
          return (
            <div className="single-weapon-container" key={idx}>
              <div>
                <label>Weapon Name:</label>
                <input
                  className="input-primary"
                  type="text"
                  value={weapon.name}
                  name="name"
                  onChange={(e) => handleChange(e, idx)}
                />
              </div>
              <div>
                <label>Weapon Category:</label>
                <input
                  className="input-primary"
                  type="text"
                  value={weapon.category}
                  name="category"
                  onChange={(e) => handleChange(e, idx)}
                />
              </div>
              <div>
                <label>Weapon Strength:</label>
                <input
                  className="input-primary"
                  type="text"
                  value={weapon.strength}
                  name="strength"
                  onChange={(e) => handleChange(e, idx)}
                />
              </div>
              <div>
                <label>Weapon Range:</label>
                <input
                  className="input-primary"
                  type="number"
                  value={weapon.range ?? ""}
                  name="range"
                  onChange={(e) => handleChange(e, idx)}
                />
              </div>
              <div>
                <label>Weapon Attributes:</label>
                <input
                  className="input-primary"
                  type="text"
                  value={weapon.weaponAttributes}
                  name="weaponAttributes"
                  onChange={(e) => handleChange(e, idx)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="new-weapon-form">
        <p>Add a new weapon</p>
        <form>
          <label>Name:</label>
          <input
            className="input-primary weapon-input"
            type="text"
            name="name"
            value={newWeapon.name}
            placeholder="Weapon Name"
            onChange={handleNewWeaponChange}
          />
        </form>
        <form>
          <label>Category:</label>
          <input
            className="input-primary"
            type="text"
            name="category"
            value={newWeapon.category}
            placeholder="Weapon Category"
            onChange={handleNewWeaponChange}
          />
        </form>

        <form>
          <label>Strength:</label>
          <input
            className="input-primary"
            type="text"
            name="strength"
            value={newWeapon.strength}
            placeholder="Strength"
            onChange={handleNewWeaponChange}
          />
        </form>

        <form>
          <label>Range:</label>
          <input
            className="input-primary"
            type="number"
            name="range"
            value={newWeapon.range ?? ""}
            placeholder="Weapon Range"
            onChange={handleNewWeaponChange}
          />
        </form>

        <form>
          <label>Attributes:</label>
          <input
            className="input-primary"
            type="text"
            name="weaponAttributes"
            value={newWeapon.weaponAttributes}
            placeholder="Weapon Attributes"
            onChange={handleNewWeaponChange}
          />
        </form>

        <button
          className="btn-primary add-weapon-btn"
          onClick={handleAddNewWeapon}
        >
          Add Weapon
        </button>
      </div>
    </div>
  );
}
