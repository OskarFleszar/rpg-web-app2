import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router";
import defaultPfp from "../../assets/images/braver-blank-pfp.jpg";
import "./CharacterPage.css";
import { CharacterBasicInfo } from "./CharacterBasicInfo";
import { CharacterAttributes } from "./CharacterAttributes";
import { CharacterSkills } from "./CharacterSkills";
import { CharacterTalentsEquipment } from "./CharacterTalentsEquipment";
import { CharacterWeapons } from "./CharacterWeapons";
import { CharacterArmor } from "./CharacterArmor";
import { CharacterGoldNotes } from "./CharacterGoldNotes";
import { BackgroundFog } from "../../styles/stypecomponents/BackgroundFog";
import { CharacterFirstInfo } from "./CharacterFirstInfo";
import { API_URL } from "../../config";
import { toImgSrc } from "./CharacterCard";

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

type CharacterImageDTO = {
  characterImage: string | null;
  imageType: string | null;
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
  const [characterImageRaw, setCharacterImageRaw] = useState<string | null>(
    null
  );
  const [imageType, setImageType] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchCharacterData();
    fetchCharacterImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const imgSrc = useMemo(() => {
    return toImgSrc(characterImageRaw, imageType || undefined);
  }, [characterImageRaw, imageType]);

  const fetchCharacterImage = async () => {
    try {
      const response = await axios.get<CharacterImageDTO>(
        `${API_URL}/api/character/characterImage/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCharacterImageRaw(response.data?.characterImage ?? null);
      setImageType(response.data?.imageType ?? null);
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęcia profilowego:", error);
      setCharacterImageRaw(null);
      setImageType(null);
    }
  };

  const fetchCharacterData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/character/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
        "An error occured while trying to upload the character data",
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
    console.log(character);
    try {
      await axios.put(`${API_URL}/api/character/${id}`, characterData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Problem przy zapisie karty postaci", error);
    }

    if (selectedImageFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImageFile);
        await axios.post(
          `${API_URL}/api/character/uploadCharacterImage/${id}`,
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
      await axios.delete(`${API_URL}/api/character/${id}`, {
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
      setCharacterImageRaw(URL.createObjectURL(file));
      setImageType(file.type || "image/jpeg");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="charcter-card-page">
        <div className="character-card-container">
          <div className="charcter-card-first-row">
            <div className="picture-container">
              <div className="character-card-page-image-wrapper">
                <img
                  className="character-image"
                  src={imgSrc || defaultPfp}
                  alt={`${character.name} profile`}
                  onError={(e) => {
                    e.currentTarget.src = defaultPfp;
                  }}
                />
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
            <NavLink to={`/characters/${id}/spellcard`}>
              <button className=" btn-secondary spell-card-button">
                Spell Card
              </button>
            </NavLink>

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
            type="EQ"
          />
          <CharacterWeapons weapons={weapons} setWeapons={setWeapons} />
          <CharacterArmor armors={armor} setArmors={setArmor} />
          <CharacterTalentsEquipment
            items={talents}
            setItems={setTalents}
            type="TALENTS"
          />
          <CharacterGoldNotes
            character={character}
            setCharacter={setCharacter}
          />
          <button
            className="btn-primary down-button"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
          <button className="btn-secondary down-button" onClick={handleDelete}>
            Delete Character
          </button>
        </div>
      </div>
      <BackgroundFog />
    </div>
  );
}
