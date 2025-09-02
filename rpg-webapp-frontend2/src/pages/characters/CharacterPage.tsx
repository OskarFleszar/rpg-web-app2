import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
  const navigate = useNavigate();
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

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [weapons, setWeapons] = useState<Weapons[]>([]);
  const [attributes, setAttributes] = useState({});
  const [skills, setSkills] = useState({});
  const [armor, setArmor] = useState<Armors[]>([]);
  const [equipment, setEquipment] = useState<Items[]>([]);
  const [talents, setTalents] = useState<Items[]>([]);
  const [characterImage, setCharacterImage] = useState<string | undefined>(
    undefined
  );

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
      if (characterImage) URL.revokeObjectURL(characterImage);
      setCharacterImage(imageUrl);
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęcia profilowego:", error);
      setCharacterImage(defaultPfp);
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
      setArmor(response.data.armor);
      setEquipment(response.data.equipment);
      setTalents(response.data.talents);
      setAttributes(response.data.attributes);
      setSkills(response.data.skills);
      console.log(response.data);
    } catch (error) {
      console.error(
        "An error occured while trying to upload the character picture",
        error
      );
    }
  };

  const handleSaveChanges = async () => {
    const characterData = {
      ...character,
      attributes,
      skills,
      weapons,
      armor,
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
          },
        }
      );
    } catch (error) {
      console.error("Problem przy zapisie karty postaci", error);
    }

    if (selectedImageFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImageFile);
        await axios.post(
          `http://localhost:8080/api/character/uploadCharacterImage/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        await fetchCharacterImage();
        setSelectedImageFile(null);
      } catch (error) {
        console.error(
          `An error occured while trying to upload the character picture`,
          error
        );
      }
    }
    navigate("/characters");
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/character/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      navigate("/characters");
    } catch (error) {
      console.error("An error occured while deleting the character:", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setCharacterImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="charcter-card-page">
      <div className="character-card-container">
        <img className="profile-picture" src={characterImage} />
        <div className="custom-file-upload">
          <label htmlFor="fileInput" className="file-label">
            Choose File
          </label>
          <input
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>
        <CharacterBasicInfo character={character} setCharacter={setCharacter} />
        <CharacterAttributes
          attributes={attributes}
          setAttributes={setAttributes}
        />
        <CharacterSkills skills={skills} setSkills={setSkills} />
        <CharacterTalentsEquipment items={equipment} setItems={setEquipment} />
        <CharacterWeapons weapons={weapons} setWeapons={setWeapons} />
        <CharacterArmor armors={armor} setArmors={setArmor} />
        <CharacterTalentsEquipment items={talents} setItems={setTalents} />
        <CharacterGoldNotes character={character} setCharacter={setCharacter} />
        <button onClick={handleSaveChanges}>Save Changes</button>
        <button onClick={handleDelete}>Delete Character</button>
      </div>
    </div>
  );
}
