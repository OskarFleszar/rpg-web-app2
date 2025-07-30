import React, { useState } from "react";
import "../styles/CharacterItems.sass";

const CharacterItems = ({ items = [], setItems }) => {
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
  });

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    setItems((prevItems) => [...prevItems, newItem]);
    setNewItem({ name: "", description: "" });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      )
    );
  };

  const handleDeleteItem = (index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <div className="character-items-container">
      {items.length > 0 ? (
        <>
          {items.map((item, index) => (
            <li key={index} className="character-items-row">
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </div>
              <div>
                <label>Description:</label>
                <textarea
                  type="text"
                  name="description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </div>
              <button
                type="button"
                className="delete-button"
                onClick={() => handleDeleteItem(index)}
              >
                Delete
              </button>
            </li>
          ))}
        </>
      ) : (
        <p></p>
      )}

      <div className="character-items-row">
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleNewItemChange}
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={newItem.description}
            onChange={handleNewItemChange}
          />
        </div>
      </div>
      <button
        type="button"
        className="character-button"
        onClick={handleAddItem}
      >
        Add
      </button>
    </div>
  );
};

export default CharacterItems;
