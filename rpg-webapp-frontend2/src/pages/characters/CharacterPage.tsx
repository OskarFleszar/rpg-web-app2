import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import defaultPfp from "../../assets/images/nig.jpg";
import "./CharacterPage.css";
import { CharacterBasicInfo } from "./CharacterBasicInfo";
import { CharacterAttributes } from "./CharacterAttributes";
import { CharacterSkills } from "./CharacterSkills";
import { CharacterTalentsEquipment } from "./CharacterTalentsEquipment";
import { CharacterWeapons } from "./CharacterWeapons";
import { CharacterArmor } from "./CharacterArmor";
import { CharacterGoldNotes } from "./CharacterGoldNotes";

export type Items = {
  name: string;
  description: string;
};

export type Weapons = {
  name: string;
  category: string;
  strength: string;
  range: number | null;
  weaponAttributes: string;
};

export type Armors = {
  armorType: string;
  location: string;
  armorPoints: number | null;
};

export function CharacterPage() {
  const { id } = useParams();
  const [character, setCharacter] = useState({
    name: "",
    race: "",
    currentProfession: "",
    lastProfession: "",
    age: 0,
    gender: "",
    eyeColor: "",
    weight: 0,
    hairColor: "",
    height: 0,
    starSign: "",
    siblings: 0,
    birthPlace: "",
    specialSigns: "",
    campaignName: "",
    campaignYear: "",
    currentExp: 0,
    totalExp: 0,
    backstory: "",
    gold: 0,
    silver: 0,
    bronze: 0,
    notes: "",
  });
  const [weapons, setWeapons] = useState<Weapons[]>([]);
  const [attributes, setAttributes] = useState({});
  const [skills, setSkills] = useState({});
  const [armors, setArmors] = useState<Armors[]>([]);
  const [equipment, setEquipment] = useState<Items[]>([]);
  const [talents, setTalents] = useState<Items[]>([]);
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchCharacterData();
    fetchCharacterImage();
  }, []);

  const fetchCharacterImage = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/character/characterImage/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      if (image) URL.revokeObjectURL(image);
      setImage(imageUrl);
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęcia profilowego:", error);
      setImage(defaultPfp);
    }
  };

  const fetchCharacterData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/character/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCharacter(response.data);
      setWeapons(response.data.weapons);
      setArmors(response.data.armor);
      setEquipment(response.data.equipment);
      setTalents(response.data.talents);
      setAttributes(response.data.attributes);
      setSkills(response.data.skills);
      console.log(response.data);
    } catch (error) {
      console.error("Błąd podczas ładowania danych postaci:", error);
    }
  };

  const handleSaveChanges = async () => {
    const characterData = {
      ...character,
      attributes,
      skills,
      weapons,
      armors,
      equipment,
      talents,
    };

    try {
      await axios.put(
        `http://localhost:8080/api/character/${id}`,
        characterData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "There was a problem saving the changes in character card",
        error
      );
    }
  };

  return (
    <div className="charcter-card-page">
      <div className="character-card-container">
        <img className="profile-picture" src={image} />
        <CharacterBasicInfo character={character} setCharacter={setCharacter} />
        <CharacterAttributes
          attributes={attributes}
          setAttributes={setAttributes}
        />
        <CharacterSkills skills={skills} setSkills={setSkills} />
        <CharacterTalentsEquipment items={equipment} setItems={setEquipment} />
        <CharacterWeapons weapons={weapons} setWeapons={setWeapons} />
        <CharacterArmor armors={armors} setArmors={setArmors} />
        <CharacterTalentsEquipment items={talents} setItems={setTalents} />
        <CharacterGoldNotes character={character} setCharacter={setCharacter} />
        <button onClick={handleSaveChanges}>Save Changes</button>
      </div>
    </div>
  );
}
