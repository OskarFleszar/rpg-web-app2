import type React from "react";
import type { Items } from "./CharacterPage";

type CharacterTalentsEqProps = {
  items: Items[];
  setItems: React.Dispatch<React.SetStateAction<Items[]>>;
};

export function CharacterTalentsEquipment({
  items,
  setItems,
}: CharacterTalentsEqProps) {
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
    idx: number
  ) => {
    const { name, value } = e.target;
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === idx ? { ...item, [name]: value } : item
      )
    );
  };
  return (
    <div className="character-talents-eq-container">
      {items.map((item, idx) => {
        return (
          <div className="single-item-container" key={idx}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={item.name}
                onChange={(e) => handleChange(e, idx)}
              />
            </div>

            <div>
              <label>Description:</label>
              <textarea
                name="description"
                value={item.description}
                onChange={(e) => handleChange(e, idx)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
