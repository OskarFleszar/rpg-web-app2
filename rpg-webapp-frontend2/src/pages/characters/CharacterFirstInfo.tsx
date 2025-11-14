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

export function CharacterFirstInfo({
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
    <div className="character-first-info-container">
      <div className="character-first-form-field-container">
        <label className="character-form-label label-first">
          Character Name:
        </label>
        <input
          type="text"
          name="name"
          value={character.name}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-first-form-field-container">
        <label className="character-form-label label-first">Race:</label>
        <input
          type="text"
          name="race"
          value={character.race}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-first-form-field-container">
        <label className="character-form-label label-first">Profession:</label>
        <input
          type="text"
          name="currentProfession"
          value={character.currentProfession}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>

      <div className="character-first-form-field-container">
        <label className="character-form-label label-first">
          Previous Profession:
        </label>
        <input
          type="text"
          name="lastProfession"
          value={character.lastProfession}
          className="input-primary character-form-input"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
