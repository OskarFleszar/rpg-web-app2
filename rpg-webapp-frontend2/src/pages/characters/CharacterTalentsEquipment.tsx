import { useState } from "react";

type CharacterTalentsEqProps = {
  items: {
    name: string;
    description: string;
    id: number | null;
  }[];
};

export function CharacterTalentsEquipment({ items }: CharacterTalentsEqProps) {
  const [itemsid] = useState(() => {
    return items.map((item) => ({ ...item, id: crypto.randomUUID() }));
  });
  return (
    <div className="character-talents-eq-container">
      {itemsid.map((item) => {
        return (
          <div className="single-item-container" key={item.id}>
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
