import type { Armors } from "./CharacterPage";

type CharacterArmorProps = {
  armors: Armors[];
  setArmors: React.Dispatch<React.SetStateAction<Armors[]>>;
};

export function CharacterArmor({ armors, setArmors }: CharacterArmorProps) {
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

  return (
    <div className="character-armor-container">
      {armors.map((armor, idx) => {
        return (
          <div className="single-armor-container" key={idx}>
            <div>
              <label>Armor type:</label>
              <input
                type="text"
                value={armor.aromrType}
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
                value={armor.armorPoints}
                name="armorPoints"
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
