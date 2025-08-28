import type React from "react";
import type { Items } from "./CharacterPage";
import { useState } from "react";

type CharacterTalentsEqProps = {
  items: Items[];
  setItems: React.Dispatch<React.SetStateAction<Items[]>>;
};

export function CharacterTalentsEquipment({
  items,
  setItems,
}: CharacterTalentsEqProps) {
  const [newItem, setNewItem] = useState<Items>({
    name: "",
    description: "",
  });

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

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    if (!newItem.name) {
      return;
    }
    setItems((prevItems) => [...prevItems, newItem]);
    setNewItem({ name: "", description: "" });
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

      <div className="add-item-form">
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={newItem.name}
          onChange={handleNewItemChange}
        />

        <input
          type="text"
          placeholder="Description"
          name="description"
          value={newItem.description}
          onChange={handleNewItemChange}
        />
        <button onClick={handleAddItem}>Add</button>
      </div>
    </div>
  );
}
