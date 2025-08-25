type CharacterProps = {
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

export function CharacterGoldNotes({ character }: CharacterProps) {
  return (
    <div className="character-gold-and-notes-container">
      <div className="coins-container">
        <div>
          <label>Gold Coins:</label>
          <input type="number" name="gold" value={character.gold} />
        </div>
        <div>
          <label>Silver Coins:</label>
          <input type="number" name="silver" value={character.silver} />
        </div>
        <div>
          <label>Bronze Coins:</label>
          <input type="number" name="bronze" value={character.bronze} />
        </div>
      </div>

      <div className="backstory-container">
        <div>
          <label>Backstory:</label>
          <textarea name="backstory" value={character.backstory}></textarea>
        </div>
        <div>
          <label>Notes:</label>
          <textarea name="notes" value={character.notes}></textarea>
        </div>
      </div>
    </div>
  );
}
