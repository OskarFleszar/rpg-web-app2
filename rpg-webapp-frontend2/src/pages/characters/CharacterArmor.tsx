import { useState } from "react";
import type { Armors } from "./CharacterPage";

type CharacterArmorProps = {
  armors: Armors[];
  setArmors: React.Dispatch<React.SetStateAction<Armors[]>>;
};

export function CharacterArmor({ armors, setArmors }: CharacterArmorProps) {
  const [newArmor, setNewArmor] = useState<Armors>({
    armorType: "",
    location: "",
    armorPoints: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const { name, value } = e.target;
    setArmors((prevArmors) =>
      prevArmors.map((armor, i) =>
        i === idx ? { ...armor, [name]: value } : armor
      )
    );
  };

  const handleNewArmorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewArmor((prevArmor) => ({
      ...prevArmor,
      [name]: value,
    }));
  };

  const handleAddNewArmor = () => {
    if (!newArmor.armorType) {
      return;
    }
    setArmors((prevArmors) => [...prevArmors, newArmor]);
    setNewArmor({ armorType: "", location: "", armorPoints: 0 });
  };

  return (
    <div className="character-armor-container">
      {armors.map((armor, idx) => {
        return (
          <div className="single-armor-container" key={idx}>
            <div>
              <label>Armor type:</label>
              <input
                type="text"
                value={armor.armorType}
                name="aromrType"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
            <div>
              <label>Armor location:</label>
              <input
                type="text"
                value={armor.location}
                name="location"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
            <div>
              <label>Armor points:</label>
              <input
                type="text"
                value={armor.armorPoints ?? ""}
                name="armorPoints"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
          </div>
        );
      })}

      <div className="new-armor-form">
        <input
          type="text"
          name="armorType"
          placeholder="Armor Type"
          value={newArmor.armorType}
          onChange={handleNewArmorChange}
        />

        <input
          type="text"
          name="location"
          placeholder="location"
          value={newArmor.location}
          onChange={handleNewArmorChange}
        />

        <input
          type="number"
          name="armorPoints"
          placeholder="Armor Points"
          value={newArmor.armorPoints ?? ""}
          onChange={handleNewArmorChange}
        />
        <button onClick={handleAddNewArmor}>Add Armor</button>
      </div>
    </div>
  );
}
