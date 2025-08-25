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
  const [weapons, setWeapons] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [skills, setSkills] = useState({});
  const [armors, setArmors] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [talents, setTalents] = useState([]);
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

  return (
    <div className="charcter-card-page">
      <div className="character-card-container">
        <CharacterBasicInfo character={character} />
        <CharacterAttributes attributes={attributes} />
        <CharacterSkills skills={skills} />
        <CharacterTalentsEquipment items={equipment} />
        <CharacterWeapons weapons={weapons} />
        <CharacterArmor armors={armors} />
        <CharacterTalentsEquipment items={talents} />
        <CharacterGoldNotes character={character} />
      </div>
    </div>
  );
}
