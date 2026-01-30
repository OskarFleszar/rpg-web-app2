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

export function CharacterGoldNotes({
  character,
  setCharacter,
}: CharacterBasicInfoProps) {
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCharacter((prevCharacter) => ({
      ...prevCharacter,
      [name]: value,
    }));
  };
  return (
    <div className="character-gold-and-notes-container">
      <div className="section-title">Gold</div>
      <div className="coins-container">
        <div>
          <label>Gold Coins:</label>
          <input
            className="input-primary"
            type="number"
            name="gold"
            value={character.gold}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Silver Coins:</label>
          <input
            className="input-primary"
            type="number"
            name="silver"
            value={character.silver}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Bronze Coins:</label>
          <input
            className="input-primary"
            type="number"
            name="bronze"
            value={character.bronze}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="backstory-container">
        <label>Backstory</label>
        <textarea
          className="input-primary"
          name="backstory"
          value={character.backstory}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className="notes-container">
        <label>Notes</label>
        <textarea
          className="input-primary"
          name="notes"
          value={character.notes}
          onChange={handleChange}
        ></textarea>
      </div>
    </div>
  );
}
