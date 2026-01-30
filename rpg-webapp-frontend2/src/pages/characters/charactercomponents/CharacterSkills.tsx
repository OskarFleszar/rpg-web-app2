import { useState } from "react";

type Level = SkillInfo["level"];

const LEVELS: Level[] = ["NOT_PURCHASED", "PURCHASED", "PLUS_10", "PLUS_20"];

const LEVEL_LABELS: Record<Level, string> = {
  NOT_PURCHASED: "NOT PURCHASED",
  PURCHASED: "PURCHASED",
  PLUS_10: "+10",
  PLUS_20: "+20",
};

const ROLL_FOR_OPTIONS: RollFor[] = [
  "Fellowship",
  "Intelligence",
  "Agility",
  "Toughness",
  "Strength",
  "Willpower",
];

type RollFor =
  | "Fellowship"
  | "Intelligence"
  | "Agility"
  | "Toughness"
  | "Strength"
  | "Willpower";

type SkillInfo = {
  level: "NOT_PURCHASED" | "PURCHASED" | "PLUS_10" | "PLUS_20";
  type: "BASIC" | "ADVANCED";
  rollFor: RollFor;
};

type Skills = Record<string, SkillInfo>;

type CharacterSkillsProps = {
  skills: Skills;
  setSkills: React.Dispatch<React.SetStateAction<Skills>>;
};

export function CharacterSkills({ skills, setSkills }: CharacterSkillsProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillRollFor, setNewSkillRollFor] =
    useState<RollFor>("Intelligence");

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
    if (!newSkillName || !newSkillRollFor) return;
    setSkills((prevSkills) => ({
      ...prevSkills,
      [newSkillName]: {
        level: "PURCHASED",
        type: "ADVANCED",
        rollFor: newSkillRollFor,
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
      <div className="section-title">Basic Skils</div>
      <div className="basic-skills-container">
        {baseSkills.map(([skillName, skillInfo]) => {
          return (
            <div className="single-skill-container" key={skillName}>
              <div className="skill-name">{skillName}</div>
              <div className="skill-values">
                {LEVELS.map((level) => {
                  const inputId = `${skillName}-${level}`;
                  return (
                    <div className="skill-levels-container" key={level}>
                      <input
                        id={inputId}
                        type="radio"
                        name={skillName}
                        value={level}
                        checked={skillInfo.level === level}
                        onChange={handleChange}
                      />
                      <label htmlFor={inputId}>{LEVEL_LABELS[level]}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="section-title">Advanced Skills</div>
      <div className="advanced-skills-container">
        <div className="advanced-skills-container-grid">
          {advancedSkills.map(([skillName, skillInfo]) => {
            return (
              <div className="single-skill-container" key={skillName}>
                <div className="skill-name">{skillName}</div>
                <div className="skill-values">
                  {LEVELS.map((level) => {
                    const inputId = `${skillName}-${level}`;
                    return (
                      <div className="skill-levels-container" key={level}>
                        <input
                          id={inputId}
                          type="radio"
                          name={skillName}
                          value={level}
                          checked={skillInfo.level === level}
                          onChange={handleChange}
                        />{" "}
                        <label htmlFor={inputId}>{LEVEL_LABELS[level]}</label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="add-skill-form">
          <input
            className="input-primary"
            type="text"
            placeholder="Skill Name"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
          />
          <select
            className="input-primary"
            value={newSkillRollFor}
            onChange={(e) => setNewSkillRollFor(e.target.value as RollFor)}
          >
            {ROLL_FOR_OPTIONS.map((attribute) => (
              <option value={attribute} key={attribute}>
                {attribute}
              </option>
            ))}
          </select>
          <button
            className="btn-primary add-skill-btn"
            onClick={handleAddSkill}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
