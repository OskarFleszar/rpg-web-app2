import type React from "react";
import type { Items } from "./CharacterPage";
import { useState } from "react";

type CharacterTalentsEqProps = {
  items: Items[];
  setItems: React.Dispatch<React.SetStateAction<Items[]>>;
  type: "EQ" | "TALENTS";
};

export function CharacterTalentsEquipment({
  items,
  setItems,
  type,
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

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number
  ) => {
    const target = e.target;

    target.style.height = "35px";
    target.style.height = `${target.scrollHeight}px`;

    handleChange(e, idx);
  };

  return (
    <div className="character-talents-eq-container">
      <div className="section-title">
        {type === "EQ" ? "Equipment" : "Talents"}
      </div>
      <div className="items-grid">
        {items.map((item, idx) => (
          <div className="single-item-container" key={idx}>
            <div className="item-header">
              <label>Name</label>
              <input
                className="input-primary"
                type="text"
                name="name"
                value={item.name}
                onChange={(e) => handleChange(e, idx)}
              />
            </div>

            <div className="item-body">
              <label>Description</label>
              <textarea
                className="input-primary item-textarea"
                name="description"
                value={item.description}
                onChange={(e) => handleTextareaChange(e, idx)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="add-item-form">
        <input
          className="input-primary"
          type="text"
          placeholder="Name"
          name="name"
          value={newItem.name}
          onChange={handleNewItemChange}
        />
        <input
          className="input-primary"
          type="text"
          placeholder="Description"
          name="description"
          value={newItem.description}
          onChange={handleNewItemChange}
        />
        <button className="btn-primary" onClick={handleAddItem}>
          Add
        </button>
      </div>
    </div>
  );
}
