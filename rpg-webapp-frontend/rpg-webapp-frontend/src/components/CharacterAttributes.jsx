import React from "react";
import "../styles/CharacterAttributes.sass";

const CharacterAttributes = ({ attributes, setAttributes }) => {
  if (!attributes || Object.keys(attributes).length === 0) {
    return <p>Ładowanie atrybutów...</p>;
  }

  const handleAttributeChange = (name, field, value) => {
    setAttributes((prevAttributes) => ({
      ...prevAttributes,
      [name]: {
        ...prevAttributes[name],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  return (
    <div className="character-attributes">
      <div className="attributes-container">
        <div className="attributes-grid">
          {Object.entries(attributes).map(([key, attr]) => (
            <div className="attribute-group" key={key}>
              <div className="attribute-name">{key}</div>
              <div className="attribute-values">
                <div className="value-label">Starting value</div>
                <div className="value-input">
                  <input
                    type="number"
                    value={attr.baseValue || 0}
                    onChange={(e) =>
                      handleAttributeChange(key, "baseValue", e.target.value)
                    }
                  />
                </div>
                <div className="value-label">Advancement</div>
                <div className="value-input">
                  <input
                    type="number"
                    value={attr.advancementPoints || 0}
                    onChange={(e) =>
                      handleAttributeChange(
                        key,
                        "advancementPoints",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="value-label">Current</div>
                <div className="value-input">
                  <input
                    type="number"
                    value={attr.currentValue || 0}
                    onChange={(e) =>
                      handleAttributeChange(key, "currentValue", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterAttributes;
