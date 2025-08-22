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
    items.map((item) => ({ ...item, id: crypto.randomUUID() }));
  });
  return (
    <div className="character-talents-eq-container">
      {items.map((itemsid) => {
        return (
          <div className="single-item-container" key={itemsid.id}>
            <div>
              <label>Name:</label>
              <input type="text" name="name" value={itemsid.name} />
            </div>

            <div>
              <label>Description:</label>
              <textarea
                name="description"
                value={itemsid.description}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
