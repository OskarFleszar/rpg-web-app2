import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CharacterSkills from "../components/CharacterSkills";
import CharacterWeapons from "../components/CharacterWeapons";
import CharacterArmor from "../components/CharacterArmor";
import CharacterItems from "../components/CharacterItems";
import axios from "axios";
import "../styles/CharacterForm.sass";

import CharacterAttributes from "../components/CharacterAttributes";

const CharacterForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const dataFetchedRef = useRef(false);

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
  const [armor, setArmor] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [talents, setTalents] = useState([]);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [image, setImage] = useState(null);
  const [isEditingImage, setIsEditingImage] = useState(false);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const fetchCharacterData = async () => {
      try {
        if (isEditMode) {
          const response = await axios.get(
            `http://localhost:8080/api/character/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const data = response.data;
          setCharacter(data);
          setWeapons(data.weapons || []);
          setArmor(data.armor || []);
          setEquipment(data.equipment || []);
          setTalents(data.talents || []);
          setAttributes(data.attributes.attributes || data.attributes);
          setSkills(data.skills.skills || data.skills);
          console.log("Pobrane skile postaci:", data.skills);
          console.log("Pobrane atrybuty postaci:", data.attributes);
        } else {
          const responseSkl = await axios.get(
            "http://localhost:8080/api/character/default-skills",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const responseAtt = await axios.get(
            "http://localhost:8080/api/character/default-attributes",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setSkills(responseSkl.data.skills || {});
          setAttributes(responseAtt.data.attributes || {});
        }
      } catch (error) {
        console.error("Błąd podczas ładowania danych postaci:", error);
      }
    };

    fetchCharacterData();
    fetchCharacterImage();
  }, [id, isEditMode]);

  const fetchCharacterImage = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/character/characterImage/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "arraybuffer",
        }
      );

      const base64Image = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      setImageUrl(`data:image/jpeg;base64,${base64Image}`);
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęcia postaci:", error);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleEdit = () => {
    setIsEditingImage(!isEditingImage);
  };

  const handleImageUpload = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("file", image);

    try {
      await axios.post(
        `http://localhost:8080/api/character/uploadCharacterImage/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Zdjęcie profilowe zostało zaktualizowane");
      fetchCharacterImage();
    } catch (error) {
      console.error("Błąd podczas przesyłania obrazu: ", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/character/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      navigate("/characters");
    } catch (error) {
      console.error("Błąd podczas usuwania postaci:", error);
    }
  };

  const prepareAttributesForBackend = (attributes) => {
    const formattedAttributes = {};
    for (const [name, values] of Object.entries(attributes)) {
      formattedAttributes[name] = {
        baseValue: values.baseValue || 0,
        advancementPoints: values.advancementPoints || 0,
        currentValue: values.currentValue || 0,
      };
    }
    return { attributes: formattedAttributes };
  };

  const prepareSkillsForBackend = (skills) => {
    const formattedSkills = {};
    for (const [skillName, skillInfo] of Object.entries(skills)) {
      formattedSkills[skillName] = {
        level: skillInfo.level,
        type: skillInfo.type,
      };
    }
    return { skills: formattedSkills };
  };

  const handleSaveChanges = async () => {
    const characterData = {
      ...character,
      attributes: prepareAttributesForBackend(attributes),
      skills: prepareSkillsForBackend(skills),
      weapons,
      armor,
      equipment,
      talents,
    };
    console.log("Dane do wysłania:", JSON.stringify(characterData, null, 2));

    try {
      if (isEditMode) {
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
      } else {
        await axios.post("http://localhost:8080/api/character", characterData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
      }
      setMessage("Changes saved successfully.");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacter((prevCharacter) => ({
      ...prevCharacter,
      [name]: value,
    }));
  };

  return (
    <div className="character-details-container">
      <div className="character-details">
        <div className="character-image">
          {imageUrl ? (
            isEditingImage ? (
              <>
                <img className="img" src={imageUrl} alt="Profile" />
                <input type="file" onChange={handleImageChange} />
                <button onClick={handleImageUpload}>Upload Image</button>
              </>
            ) : (
              <img className="img" src={imageUrl} alt="Profile" />
            )
          ) : (
            <>
              <input type="file" onChange={handleImageChange} />
              <button onClick={handleImageUpload}>Upload Image</button>
            </>
          )}
        </div>
        <div>
          {isEditingImage ? (
            <button onClick={handleEdit}>Cancel</button>
          ) : (
            <button onClick={handleEdit}>Edit</button>
          )}
        </div>
        <form>
          <div>
            <label>Character Name:</label>
            <input
              type="text"
              name="name"
              value={character.name || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Race:</label>
            <input
              type="text"
              name="race"
              value={character.race || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Profession:</label>
            <input
              type="text"
              name="currentProfession"
              value={character.currentProfession || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Previous Profession:</label>
            <input
              type="text"
              name="lastProfession"
              value={character.lastProfession || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Campaign:</label>
            <input
              type="text"
              name="campaignName"
              value={character.campaignName || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Campaign Year:</label>
            <input
              type="text"
              name="campaignYear"
              value={character.campaignYear || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Age:</label>
            <input
              type="number"
              name="age"
              value={character.age || 0}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Gender:</label>
            <input
              type="text"
              name="gender"
              value={character.gender || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Eye Color:</label>
            <input
              type="text"
              name="eyeColor"
              value={character.eyeColor || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Weight:</label>
            <input
              type="number"
              name="weight"
              value={character.weight || 0}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Hair Color:</label>
            <input
              type="text"
              name="hairColor"
              value={character.hairColor || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Height:</label>
            <input
              type="number"
              name="height"
              value={character.height || 0}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Star Sign:</label>
            <input
              type="text"
              name="starSign"
              value={character.starSign || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Siblings:</label>
            <input
              type="number"
              name="siblings"
              value={character.siblings || 0}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Birthplace:</label>
            <input
              type="text"
              name="birthPlace"
              value={character.birthPlace || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Special Signs:</label>
            <input
              type="text"
              name="specialSigns"
              value={character.specialSigns || ""}
              onChange={handleChange}
            />
          </div>
          <h3>Experience</h3>
          <div>
            <label>Current Experience:</label>
            <input
              type="number"
              name="currentExp"
              value={character.currentExp || 0}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Total Experience:</label>
            <input
              type="number"
              name="totalExp"
              value={character.totalExp || 0}
              onChange={handleChange}
            />
          </div>
        </form>
        {/* Attributes Section */}
        <h3>Attributes</h3>
        <CharacterAttributes
          attributes={attributes}
          setAttributes={setAttributes}
        />
        {/* Skills Section */}
        <h3>Skills</h3>
        <CharacterSkills skills={skills} setSkills={setSkills} />

        <h3>Talents</h3>
        <CharacterItems items={talents} setItems={setTalents} />

        {/* Weapons Section */}
        <h3>Weapons</h3>
        <CharacterWeapons weapons={weapons} setWeapons={setWeapons} />

        {/* Armor Section */}
        <h3>Armor</h3>
        <CharacterArmor armor={armor} setArmor={setArmor} />

        <h3>Equipment</h3>
        <CharacterItems items={equipment} setItems={setEquipment} />

        <form>
          {/* Coins Section */}
          <h3>Coins</h3>
          <div className="coins-container">
            <div>
              <label>Gold Coins:</label>
              <input
                type="number"
                name="gold"
                value={character.gold || 0}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Silver Coins:</label>
              <input
                type="number"
                name="silver"
                value={character.silver || 0}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Bronze Coins:</label>
              <input
                type="number"
                name="bronze"
                value={character.bronze || 0}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Backstory and Notes */}
          <div className="backstory-container">
            <div>
              <label>Backstory:</label>
              <textarea
                name="backstory"
                value={character.backstory || ""}
                onChange={handleChange}
              ></textarea>
            </div>
            <div>
              <label>Notes:</label>
              <textarea
                name="notes"
                value={character.notes || ""}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* Save Button */}
          <button type="button" onClick={handleSaveChanges}>
            {isEditMode ? "Save Changes" : "Create Character"}
          </button>
          {isEditMode && (
            <button type="button" onClick={handleDelete}>
              Delete Character
            </button>
          )}
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default CharacterForm;
