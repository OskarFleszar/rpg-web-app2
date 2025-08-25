type CharacterArmorProps = {
  armors: {
    aromrType: string;
    location: string;
    armorPoints: number;
  }[];
};

export function CharacterArmor({ armors }: CharacterArmorProps) {
  return (
    <div className="character-armor-container">
      {armors.map((armor, idx) => {
        return (
          <div className="single-armor-container" key={idx}>
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
