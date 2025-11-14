import axios from "axios";
import { useEffect, useState } from "react";
import defaultPfp from "../../assets/images/nig.jpg";
import "./CharacterPage.css";
import { CharacterBasicInfo } from "./CharacterBasicInfo";
import { CharacterAttributes } from "./CharacterAttributes";
import { CharacterSkills } from "./CharacterSkills";
import { CharacterTalentsEquipment } from "./CharacterTalentsEquipment";
import { CharacterWeapons } from "./CharacterWeapons";
import { CharacterArmor } from "./CharacterArmor";
import { CharacterGoldNotes } from "./CharacterGoldNotes";
import type { Armors, Items, Weapons } from "./CharacterPage";
import { useNavigate } from "react-router";
import { BackgroundFog } from "../../styles/stypecomponents/BackgroundFog";
import { CharacterFirstInfo } from "./CharacterFirstInfo";

export function CreateCharacterPage() {
  const navigate = useNavigate();
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
    defaultPfp
  );

  useEffect(() => {
    getDefaultSkillsAndAttributes();
  }, []);

  const getDefaultSkillsAndAttributes = async () => {
    try {
      const responseSkills = await axios.get(
        "http://localhost:8080/api/character/default-skills",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const responseAttributes = await axios.get(
        "http://localhost:8080/api/character/default-attributes",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSkills(responseSkills.data);
      setAttributes(responseAttributes.data);
    } catch (error) {
      console.error("An error occured fetching skills and attributes", error);
    }
  };

  const handleSaveCharacter = async () => {
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
      const response = await axios.post(
        `http://localhost:8080/api/character`,
        characterData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const id = response.data;

      if (selectedImageFile && id) {
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
        setSelectedImageFile(null);
      }
      navigate("/characters");
    } catch (error) {
      console.error(
        `An error occured while trying to upload the character picture`,
        error
      );
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
    <div className="page-wrapper">
      <div className="charcter-card-page">
        <div className="character-card-container">
          <div className="charcter-card-first-row">
            <div className="picture-container">
              <div className="character-card-page-image-wrapper">
                <img className="character-image" src={characterImage} />
              </div>
              <div className="custom-file-upload">
                <label htmlFor="fileInput" className="file-label">
                  Change Picture
                </label>
                <input
                  id="fileInput"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <CharacterFirstInfo
              character={character}
              setCharacter={setCharacter}
            />
          </div>
          <CharacterBasicInfo
            character={character}
            setCharacter={setCharacter}
          />
          <CharacterAttributes
            attributes={attributes}
            setAttributes={setAttributes}
          />
          <CharacterSkills skills={skills} setSkills={setSkills} />
          <CharacterTalentsEquipment
            items={equipment}
            setItems={setEquipment}
          />
          <CharacterWeapons weapons={weapons} setWeapons={setWeapons} />
          <CharacterArmor armors={armor} setArmors={setArmor} />
          <CharacterTalentsEquipment items={talents} setItems={setTalents} />
          <CharacterGoldNotes
            character={character}
            setCharacter={setCharacter}
          />
          <button onClick={handleSaveCharacter}>Create Character</button>
        </div>
      </div>
      <BackgroundFog />
    </div>
  );
}
