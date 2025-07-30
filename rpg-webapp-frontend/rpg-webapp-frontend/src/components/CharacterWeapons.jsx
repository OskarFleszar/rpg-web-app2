import React, { useState } from "react";
import "../styles/CharacterWeapons.sass";

const CharacterWeapons = ({ weapons = [], setWeapons }) => {
  const [newWeapon, setNewWeapon] = useState({
    name: "",
    category: "",
    strength: "",
    range: "",
    weaponAttributes: "",
  });

  const handleNewWeaponChange = (e) => {
    const { name, value } = e.target;
    setNewWeapon((prevWeapon) => ({
      ...prevWeapon,
      [name]: value,
    }));
  };

  const handleAddWeapon = () => {
    setWeapons((prevWeapons) => [...prevWeapons, newWeapon]);
    setNewWeapon({
      name: "",
      category: "",
      strength: "",
      range: "",
      weaponAttributes: "",
    });
  };

  const handleWeaponChange = (index, e) => {
    const { name, value } = e.target;
    setWeapons((prevWeapons) =>
      prevWeapons.map((weapon, i) =>
        i === index ? { ...weapon, [name]: value } : weapon
      )
    );
  };

  const handleDeleteWeapon = (index) => {
    setWeapons((prevWeapons) => prevWeapons.filter((_, i) => i !== index));
  };

  return (
    <div className="character-weapons weapons-container">
      {weapons.length > 0 && (
        <>
          {weapons.map((weapon, index) => (
            <li key={index} className="form-row">
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={weapon.name}
                  onChange={(e) => handleWeaponChange(index, e)}
                />
              </div>
              <div>
                <label>Category:</label>
                <input
                  type="text"
                  name="category"
                  value={weapon.category}
                  onChange={(e) => handleWeaponChange(index, e)}
                />
              </div>
              <div>
                <label>Strength:</label>
                <input
                  type="text"
                  name="strength"
                  value={weapon.strength}
                  onChange={(e) => handleWeaponChange(index, e)}
                />
              </div>
              <div>
                <label>Range:</label>
                <input
                  type="text"
                  name="range"
                  value={weapon.range}
                  onChange={(e) => handleWeaponChange(index, e)}
                />
              </div>
              <div>
                <label>Attributes:</label>
                <input
                  type="text"
                  name="weaponAttributes"
                  value={weapon.weaponAttributes}
                  onChange={(e) => handleWeaponChange(index, e)}
                />
              </div>
              <button
                type="button"
                className="delete-button"
                onClick={() => handleDeleteWeapon(index)}
              >
                Delete
              </button>
            </li>
          ))}
        </>
      )}

      <h4>Add new weapon</h4>
      <div className="form-row">
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={newWeapon.name}
            onChange={handleNewWeaponChange}
          />
        </div>
        <div>
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={newWeapon.category}
            onChange={handleNewWeaponChange}
          />
        </div>
        <div>
          <label>Strength:</label>
          <input
            type="text"
            name="strength"
            value={newWeapon.strength}
            onChange={handleNewWeaponChange}
          />
        </div>
        <div>
          <label>Range:</label>
          <input
            type="text"
            name="range"
            value={newWeapon.range}
            onChange={handleNewWeaponChange}
          />
        </div>
        <div>
          <label>Attributes:</label>
          <input
            type="text"
            name="weaponAttributes"
            value={newWeapon.weaponAttributes}
            onChange={handleNewWeaponChange}
          />
        </div>
      </div>
      <button type="button" className="small-button" onClick={handleAddWeapon}>
        Add weapon
      </button>
    </div>
  );
};

export default CharacterWeapons;
