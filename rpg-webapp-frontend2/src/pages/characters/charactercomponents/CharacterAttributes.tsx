type Attribute = {
  baseValue: number;
  advancementPoints: number;
  currentValue: number;
};

type Attributes = Record<string, Attribute>;

type AttributesProps = {
  attributes: Attributes;
  setAttributes: React.Dispatch<React.SetStateAction<Attributes>>;
  currentHealth: number;
  setCurrentHealth: (v: number) => void;
};

export function CharacterAttributes({
  attributes,
  setAttributes,
  currentHealth,
  setCurrentHealth,
}: AttributesProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Attribute,
  ) => {
    const { name, value } = e.target;
    setAttributes((prevAttributes) => ({
      ...prevAttributes,
      [name]: {
        ...prevAttributes[name],
        [field]: parseInt(value),
      },
    }));
  };

  return (
    <div className="character-attributes-container">
      <div className="section-title">Attributes</div>
      <div className="attributes-grid">
        {Object.entries(attributes).map(([attributeName, attributeValues]) => {
          return (
            <div className="single-attribute-container" key={attributeName}>
              <div className="attribute-name">{attributeName}</div>
              <div className="attribute-value">
                <form>
                  <label>Starting Value:</label>
                  <input
                    className="input-primary"
                    type="number"
                    name={attributeName}
                    value={attributeValues.baseValue}
                    onChange={(e) => {
                      handleChange(e, "baseValue");
                    }}
                  />
                </form>
              </div>
              <div className="attribute-value">
                <form>
                  <label>Advancement:</label>
                  <input
                    className="input-primary"
                    type="number"
                    name={attributeName}
                    value={attributeValues.advancementPoints}
                    onChange={(e) => {
                      handleChange(e, "advancementPoints");
                    }}
                  />
                </form>
              </div>
              {attributeName == "Health" ? (
                <div className="attribute-value">
                  <form>
                    <label>Current Value:</label>

                    <div className="hp-row">
                      <input
                        className="input-primary health-value"
                        type="number"
                        name={attributeName}
                        value={currentHealth}
                        onChange={(e) => {
                          const raw =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          const maxHp = attributeValues.currentValue ?? 0;
                          setCurrentHealth(Math.max(0, Math.min(raw, maxHp)));
                        }}
                      />

                      <span className="hp-separator" aria-hidden="true">
                        /
                      </span>
                      <input
                        className="input-primary health-value"
                        type="number"
                        name={attributeName}
                        value={attributeValues.currentValue}
                        onChange={(e) => {
                          handleChange(e, "currentValue");
                        }}
                      />
                    </div>
                  </form>
                </div>
              ) : (
                <div className="attribute-value">
                  <form>
                    <label>Current Value:</label>
                    <input
                      className="input-primary"
                      type="number"
                      name={attributeName}
                      value={attributeValues.currentValue}
                      onChange={(e) => {
                        handleChange(e, "currentValue");
                      }}
                    />
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
