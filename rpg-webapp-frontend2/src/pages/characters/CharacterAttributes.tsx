type Attribute = {
  baseValue: number;
  advancementPoints: number;
  currentValue: number;
};

type Attributes = Record<string, Attribute>;

type AttributesProps = {
  attributes: Attributes;
};

export function CharacterAttributes({ attributes }: AttributesProps) {
  return (
    <div className="character-attributes-container">
      <div className="attributes-grid">
        {Object.entries(attributes).map(([key, attribute]) => {
          return (
            <div className="single-attribute-container" key={key}>
              <div className="attribute-name">{key}</div>
              <div className="attribute-value">
                <form>
                  <label>Starting Value:</label>
                  <input type="number" value={attribute.baseValue} />
                </form>
              </div>
              <div className="attribute-value">
                <form>
                  <label>Advancement:</label>
                  <input type="number" value={attribute.advancementPoints} />
                </form>
              </div>
              <div className="attribute-value">
                <form>
                  <label>Current Value:</label>
                  <input type="number" value={attribute.currentValue} />
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
