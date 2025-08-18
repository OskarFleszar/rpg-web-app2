type Character = {
  character: {
    name: string;
    race: string;
    currentProfession: string;
    lastProfession: string;
    age: number;
    gender: string;
    eyeColor: string;
    weight: number;
    hairColor: string;
    height: number;
    starSign: string;
    siblings: number;
    birthPlace: string;
    specialSigns: string;
    campaignName: string;
    campaignYear: string;
    currentExp: number;
    totalExp: number;
    backstory: string;
    gold: number;
    silver: number;
    bronze: number;
    notes: string;
  };
};

export function CharacterBasicInfo({ character }: Character) {
  return (
    <div className="character-basic-info-container">
      <form>
        <div className="character-form-field-container">
          <label className="character-form label">Character Name:</label>
          <input
            type="text"
            name="name"
            value={character.name}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Race:</label>
          <input
            type="text"
            name="race"
            value={character.race}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Profession:</label>
          <input
            type="text"
            name="currentProfession"
            value={character.currentProfession}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Previous Profession:</label>
          <input
            type="text"
            name="lastProfession"
            value={character.lastProfession}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Campaign:</label>
          <input
            type="text"
            name="campaignName"
            value={character.campaignName}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Campaign Year:</label>
          <input
            type="text"
            name="campaignYear"
            value={character.campaignYear}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Age:</label>
          <input
            type="number"
            name="age"
            value={character.age}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Gender:</label>
          <input
            type="text"
            name="gender"
            value={character.gender}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Eye Color:</label>
          <input
            type="text"
            name="eyeColor"
            value={character.eyeColor}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Weight:</label>
          <input
            type="number"
            name="weight"
            value={character.weight}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Hair Color:</label>
          <input
            type="text"
            name="hairColor"
            value={character.hairColor}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Height:</label>
          <input
            type="number"
            name="height"
            value={character.height}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Star Sign:</label>
          <input
            type="text"
            name="starSign"
            value={character.starSign}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Siblings:</label>
          <input
            type="number"
            name="siblings"
            value={character.siblings}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Birthplace:</label>
          <input
            type="text"
            name="birthPlace"
            value={character.birthPlace}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Special Signs:</label>
          <input
            type="text"
            name="specialSigns"
            value={character.specialSigns}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Expirience:</label>
          <input
            type="number"
            name="currentExp"
            value={character.currentExp}
            className="character-form-input"
          />
        </div>

        <div className="character-form-field-container">
          <label className="character-form label">Total Expirience:</label>
          <input
            type="number"
            name="totalExp"
            value={character.totalExp}
            className="character-form-input"
          />
        </div>
      </form>
    </div>
  );
}
