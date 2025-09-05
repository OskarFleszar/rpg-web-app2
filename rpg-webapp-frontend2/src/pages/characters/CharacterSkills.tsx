import { useState } from "react";

type Level = SkillInfo["level"];

const LEVELS: Level[] = ["NOT_PURCHASED", "PURCHASED", "PLUS_10", "PLUS_20"];

const LEVEL_LABELS: Record<Level, string> = {
  NOT_PURCHASED: "NOT PURCHASED",
  PURCHASED: "PURCHASED",
  PLUS_10: "+10",
  PLUS_20: "+20",
};

type SkillInfo = {
  level: "NOT_PURCHASED" | "PURCHASED" | "PLUS_10" | "PLUS_20";
  type: "BASIC" | "ADVANCED";
};

type Skills = Record<string, SkillInfo>;

type CharacterSkillsProps = {
  skills: Skills;
  setSkills: React.Dispatch<React.SetStateAction<Skills>>;
};

export function CharacterSkills({ skills, setSkills }: CharacterSkillsProps) {
  const [newSkillName, setNewSkillName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const level = value as SkillInfo["level"];
    setSkills((prevSkills) => ({
      ...prevSkills,
      [name]: {
        ...prevSkills[name],
        level: level,
      },
    }));
  };

  const handleAddSkill = () => {
    if (!newSkillName) {
      return;
    }
    setSkills((prevSkills) => ({
      ...prevSkills,
      [newSkillName]: {
        level: "PURCHASED",
        type: "ADVANCED",
      },
    }));
    setNewSkillName("");
  };

  const baseSkills = Object.entries(skills).filter(([, skillInfo]) => {
    return skillInfo.type === "BASIC";
  });

  const advancedSkills = Object.entries(skills).filter(([, skillInfo]) => {
    return skillInfo.type === "ADVANCED";
  });

  return (
    <div className="character-skills-container">
      <div className="basic-skills-container">
        {baseSkills.map(([skillName, skillInfo]) => {
          return (
            <div className="single-skill-container" key={skillName}>
              <div className="skill-name">{skillName}</div>

              {LEVELS.map((level) => {
                return (
                  <div className="skill-levels-container" key={level}>
                    <label>{LEVEL_LABELS[level]}</label>
                    <input
                      type="radio"
                      name={skillName}
                      value={level}
                      checked={skillInfo.level === level}
                      onChange={handleChange}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="advanced-skills-container">
        {advancedSkills.map(([skillName, skillInfo]) => {
          return (
            <div className="single-skill-container" key={skillName}>
              <div className="skill-name">{skillName}</div>

              {LEVELS.map((level) => {
                return (
                  <div className="skill-levels-container" key={level}>
                    <label>{LEVEL_LABELS[level]}</label>
                    <input
                      type="radio"
                      name={skillName}
                      value={level}
                      checked={skillInfo.level === level}
                      onChange={handleChange}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="add-skill-form">
        <input
          type="text"
          placeholder="Skill Name"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
        />
        <button onClick={handleAddSkill}>Add Skill</button>
      </div>
    </div>
  );
}
