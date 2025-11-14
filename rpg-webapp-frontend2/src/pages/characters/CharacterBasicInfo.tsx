type CharacterProps = {
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

type CharacterBasicInfoProps = {
  character: CharacterProps;
  setCharacter: React.Dispatch<React.SetStateAction<CharacterProps>>;
};

export function CharacterBasicInfo({
  character,
  setCharacter,
}: CharacterBasicInfoProps) {
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCharacter((prevCharacter) => ({
      ...prevCharacter,
      [name]: value,
    }));
  };

  return (
    <div className="character-basic-info-container">
      <div className="character-form-field-container">
        <label className="character-form-label">Campaign:</label>
        <input
          type="text"
          name="campaignName"
          value={character.campaignName}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Campaign Year:</label>
        <input
          type="text"
          name="campaignYear"
          value={character.campaignYear}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Age:</label>
        <input
          type="number"
          name="age"
          value={character.age}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Gender:</label>
        <select
          name="gender"
          className="input-primary character-form-input"
          onChange={handleChange}
          value={character.gender}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Eye Color:</label>
        <input
          type="text"
          name="eyeColor"
          value={character.eyeColor}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Weight:</label>
        <input
          type="number"
          name="weight"
          value={character.weight}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Hair Color:</label>
        <input
          type="text"
          name="hairColor"
          value={character.hairColor}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Height:</label>
        <input
          type="number"
          name="height"
          value={character.height}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Star Sign:</label>
        <input
          type="text"
          name="starSign"
          value={character.starSign}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Siblings:</label>
        <input
          type="number"
          name="siblings"
          value={character.siblings}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Birthplace:</label>
        <input
          type="text"
          name="birthPlace"
          value={character.birthPlace}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Special Signs:</label>
        <input
          type="text"
          name="specialSigns"
          value={character.specialSigns}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Expirience:</label>
        <input
          type="number"
          name="currentExp"
          value={character.currentExp}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-form-field-container">
        <label className="character-form-label">Total Expirience:</label>
        <input
          type="number"
          name="totalExp"
          value={character.totalExp}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
