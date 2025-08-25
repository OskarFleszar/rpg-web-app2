import { useState } from "react";

type CharacterArmorProps = {
  armors: {
    aromrType: string;
    location: string;
    armorPoints: number;
    id: number | null;
  }[];
};

export function CharacterArmor({ armors }: CharacterArmorProps) {
  const [armorsid] = useState(() => {
    return armors.map((armor) => ({ ...armor, id: crypto.randomUUID() }));
  });
  return (
    <div className="character-armor-container">
      {armorsid.map((armor) => {
        return (
          <div className="single-armor-container" key={armor.id}>
            <div>
              <label>Armor type:</label>
              <input type="text" value={armor.aromrType} name="aromrType" />
            </div>
            <div>
              <label>Armor location:</label>
              <input type="text" value={armor.location} name="location" />
            </div>
            <div>
              <label>Armor points:</label>
              <input type="text" value={armor.armorPoints} name="armorPoints" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
