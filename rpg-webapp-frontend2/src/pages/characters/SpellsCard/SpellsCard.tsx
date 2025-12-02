import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./SpellsCard.css";
import { BackgroundFog } from "../../../styles/stypecomponents/BackgroundFog";
import { API_URL } from "../../../config";

type Spell = {
  spellName: string;
  powerLevel: number | null;
  castTime: number | null;
  ingredient: string;
  description: string;
};

export function SpellsCard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [spells, setSpells] = useState<Spell[]>([]);
  const [newSpell, setNewSpell] = useState<Spell>({
    spellName: "",
    powerLevel: null,
    castTime: null,
    ingredient: "",
    description: "",
  });

  useEffect(() => {
    fetchSpells();
  }, []);

  const fetchSpells = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/character/${id}/getSpells`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSpells(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("there was an error fetching spells", error);
    }
  };

  const handleSaveSpells = async () => {
    try {
      console.log(spells);
      await axios.post(`${API_URL}/api/character/${id}/saveSpells`, spells, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchSpells();
    } catch (error) {
      console.error("there was an error saving spells", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    idx: number
  ) => {
    const { name, value } = e.target;
    setSpells((prevWeapons) =>
      prevWeapons.map((spell, i) =>
        i === idx ? { ...spell, [name]: value } : spell
      )
    );
  };

  const handleNewSpellChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setNewSpell((prevSpell) => ({
      ...prevSpell,
      [name]: value,
    }));
  };

  const handleAddSpell = () => {
    if (!newSpell.spellName) {
      return;
    }

    setSpells((prevSpells) => [...prevSpells, newSpell]);
    setNewSpell({
      spellName: "",
      powerLevel: null,
      castTime: null,
      ingredient: "",
      description: "",
    });
  };

  return (
    <div className="page-wrapper">
      <div className="spells-card-page">
        <div className="section-title">Spells</div>
        <div className="spells-grid">
          {spells.map((spell, idx) => {
            return (
              <div className="single-spell-container" key={idx}>
                <div>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={spell.spellName}
                    name="spellName"
                    className="input-primary"
                    onChange={(e) => handleChange(e, idx)}
                  />
                </div>
                <div className="power-level-cast-time">
                  <div>
                    <label>Power level:</label>
                    <input
                      type="number"
                      value={spell.powerLevel || 0}
                      name="powerLevel"
                      className="input-primary"
                      onChange={(e) => handleChange(e, idx)}
                    />
                  </div>
                  <div>
                    <label>Cast time:</label>
                    <input
                      type="number"
                      value={spell.castTime || 0}
                      name="castTime"
                      className="input-primary"
                      onChange={(e) => handleChange(e, idx)}
                    />
                  </div>
                </div>
                <div>
                  <label>Ingredient:</label>
                  <input
                    type="text"
                    value={spell.ingredient}
                    name="ingredient"
                    className="input-primary"
                    onChange={(e) => handleChange(e, idx)}
                  />
                </div>
                <div>
                  <label>Description:</label>
                  <textarea
                    value={spell.description}
                    name="description"
                    className="input-primary"
                    onChange={(e) => handleChange(e, idx)}
                  />
                </div>
              </div>
            );
          })}

          <div className="add-new-spell-form">
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={newSpell.spellName}
                name="spellName"
                className="input-primary"
                onChange={handleNewSpellChange}
              />
            </div>
            <div className="power-level-cast-time">
              <div>
                <label>Power level:</label>
                <input
                  type="number"
                  value={newSpell.powerLevel || 0}
                  name="powerLevel"
                  className="input-primary"
                  onChange={handleNewSpellChange}
                />
              </div>
              <div>
                <label>Cast time:</label>
                <input
                  type="number"
                  value={newSpell.castTime || 0}
                  name="castTime"
                  className="input-primary"
                  onChange={handleNewSpellChange}
                />
              </div>
            </div>
            <div>
              <label>Ingredient:</label>
              <input
                type="text"
                value={newSpell.ingredient}
                name="ingredient"
                className="input-primary"
                onChange={handleNewSpellChange}
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                value={newSpell.description}
                name="description"
                className="input-primary"
                onChange={handleNewSpellChange}
              />
            </div>
            <button
              className="btn-primary add-spell-btn"
              onClick={handleAddSpell}
            >
              Add Spell
            </button>
          </div>
        </div>
        <div className="buttons-container">
          <button onClick={handleSaveSpells} className="btn-primary">
            Save
          </button>
          <button
            onClick={() => {
              navigate(`/characters/${id}`);
            }}
            className="btn-secondary close-btn"
          >
            Close
          </button>
        </div>{" "}
      </div>
      <BackgroundFog />
    </div>
  );
}
