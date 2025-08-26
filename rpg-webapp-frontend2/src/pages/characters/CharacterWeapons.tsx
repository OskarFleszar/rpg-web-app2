import type { Weapons } from "./CharacterPage";

type CharacterWeaponsProps = {
  weapons: Weapons[];
  setWeapons: React.Dispatch<React.SetStateAction<Weapons[]>>;
};

export function CharacterWeapons({
  weapons,
  setWeapons,
}: CharacterWeaponsProps) {
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
                value={weapon.range}
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
    </div>
  );
}
