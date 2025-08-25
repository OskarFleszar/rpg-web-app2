type CharacterTalentsEqProps = {
  items: {
    name: string;
    description: string;
  }[];
};

export function CharacterTalentsEquipment({ items }: CharacterTalentsEqProps) {
  return (
    <div className="character-talents-eq-container">
      {items.map((item, idx) => {
        return (
          <div className="single-item-container" key={idx}>
            <div>
              <label>Name:</label>
              <input type="text" name="name" value={item.name} />
            </div>

            <div>
              <label>Description:</label>
              <textarea name="description" value={item.description} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
