import React, { useState } from "react";
import "../styles/CharacterArmor.sass";

const CharacterArmor = ({ armor = [], setArmor }) => {
  const [newArmor, setNewArmor] = useState({
    armorType: "",
    location: "",
    armorPoints: "",
  });

  const handleNewArmorChange = (e) => {
    const { name, value } = e.target;
    setNewArmor((prevArmor) => ({
      ...prevArmor,
      [name]: value,
    }));
  };

  const handleAddArmor = () => {
    setArmor((prevArmor) => [...prevArmor, newArmor]);
    setNewArmor({ armorType: "", location: "", armorPoints: "" });
  };

  const handleArmorChange = (index, e) => {
    const { name, value } = e.target;
    setArmor((prevArmor) =>
      prevArmor.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      )
    );
  };

  const handleDeleteArmor = (index) => {
    setArmor((prevArmor) => prevArmor.filter((_, i) => i !== index));
  };

  return (
    <div className="character-armor-container">
      {armor.length > 0 ? (
        <>
          {armor.map((armorItem, index) => (
            <li key={index} className="character-armor-row">
              <div>
                <label>Type:</label>
                <input
                  type="text"
                  name="armorType"
                  value={armorItem.armorType}
                  onChange={(e) => handleArmorChange(index, e)}
                />
              </div>
              <div>
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={armorItem.location}
                  onChange={(e) => handleArmorChange(index, e)}
                />
              </div>
              <div>
                <label>Armor points:</label>
                <input
                  type="text"
                  name="armorPoints"
                  value={armorItem.armorPoints}
                  onChange={(e) => handleArmorChange(index, e)}
                />
              </div>
              <button
                type="button"
                className="delete-button"
                onClick={() => handleDeleteArmor(index)}
              >
                Delete
              </button>
            </li>
          ))}
        </>
      ) : (
        <p></p>
      )}

      <h4>Add new armor</h4>
      <div className="character-armor-row">
        <div>
          <label>Type:</label>
          <input
            type="text"
            name="armorType"
            value={newArmor.armorType}
            onChange={handleNewArmorChange}
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={newArmor.location}
            onChange={handleNewArmorChange}
          />
        </div>
        <div>
          <label>Armor points:</label>
          <input
            type="text"
            name="armorPoints"
            value={newArmor.armorPoints}
            onChange={handleNewArmorChange}
          />
        </div>
      </div>
      <button
        type="button"
        className="character-button"
        onClick={handleAddArmor}
      >
        Add armor
      </button>
    </div>
  );
};

export default CharacterArmor;
