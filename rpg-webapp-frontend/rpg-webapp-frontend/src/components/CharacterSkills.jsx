import React, { useState } from "react";
import "../styles/CharacterSkills.sass";

const CharacterSkills = ({ skills, setSkills }) => {
  const [newSkillName, setNewSkillName] = useState("");

  if (!skills || Object.keys(skills).length === 0) {
    return <p>Ładowanie umiejętności...</p>;
  }

  const baseSkills = Object.entries(skills).filter(
    ([, skillInfo]) => skillInfo.type !== "ADVANCED"
  );
  const customSkills = Object.entries(skills).filter(
    ([, skillInfo]) => skillInfo.type === "ADVANCED"
  );

  const handleAddSkill = () => {
    if (!newSkillName) return;
    setSkills((prevSkills) => ({
      ...prevSkills,
      [newSkillName]: {
        type: "ADVANCED",
        level: "PURCHASED",
      },
    }));
    setNewSkillName("");
  };

  return (
    <div className="character-skills">
      <div className="skills-container">
        <div className="skills-column base-skills">
          <h3>Basic Skills</h3>
          {baseSkills.map(([skillName, skillInfo]) => (
            <div key={skillName} className="skill-row">
              <label>{skillName}</label>
              <div className="skill-options">
                {["NOT_PURCHASED", "PURCHASED", "PLUS_10", "PLUS_20"].map(
                  (level) => (
                    <label key={level}>
                      <input
                        type="radio"
                        name={skillName}
                        value={level}
                        checked={skillInfo.level === level}
                        onChange={() => {
                          setSkills((prevSkills) => ({
                            ...prevSkills,
                            [skillName]: {
                              ...skillInfo,
                              level: level,
                            },
                          }));
                        }}
                      />
                      {level.replace("_", " ")}
                    </label>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="skills-column advanced-skills">
          <h3>Advanced Skills</h3>
          {customSkills.map(([skillName, skillInfo]) => (
            <div key={skillName} className="skill-row">
              <label>{skillName}</label>
              <div className="skill-options">
                {["NOT_PURCHASED", "PURCHASED", "PLUS_10", "PLUS_20"].map(
                  (level) => (
                    <label key={level}>
                      <input
                        type="radio"
                        name={skillName}
                        value={level}
                        checked={skillInfo.level === level}
                        onChange={() => {
                          setSkills((prevSkills) => ({
                            ...prevSkills,
                            [skillName]: {
                              ...skillInfo,
                              level: level,
                            },
                          }));
                        }}
                      />
                      {level.replace("_", " ")}
                    </label>
                  )
                )}
              </div>
            </div>
          ))}

          <div className="add-skill-form">
            <h4>Add a new skill</h4>
            <input
              type="text"
              placeholder="Skill name"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
            />
            <button type="button" onClick={handleAddSkill}>
              Add a skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSkills;
