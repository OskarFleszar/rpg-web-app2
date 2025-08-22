import { useEffect } from "react";

type SkillInfo = {
  level: "NOT_PURCHASED" | "PURCHASED" | "PLUS_10" | "PLUS_20";
  type: "BASIC" | "ADVANCED";
};

type Skills = Record<string, SkillInfo>;

type CharacterSkillsProps = {
  skills: Skills;
};

export function CharacterSkills({ skills }: CharacterSkillsProps) {
  const baseSkills = Object.entries(skills).filter(([,  skillInfo ]) => {
     return skillInfo.type === "BASIC";
  });

  const advancedSkills = Object.entries(skills).filter(([,  skillInfo ]) => {
    return skillInfo.type === "ADVANCED";
  });

  useEffect(() => {
    console.log(baseSkills)
  },[])

  return (
    <div className="character-skills-container">
      <div className="basic-skills-container">
        {baseSkills.map(([skillName, skillInfo]) => {
          return (
            <div className="single-skill-container" key={skillName}>
              <div className="skill-name">{skillName}</div>

              {["NOT_PURCHASED", "PURCHASED", "PLUS_10", "PLUS_20"].map(
                (level) => {
                  return (
                  <div className="skill-levels-container">
                    <label key={level}>{level}</label>
                    <input 
                      type="radio"
                      name={skillName} 
                      value={level}
                      checked={skillInfo.level === level}
                    />
                  </div>
                  );
                }
              )}
            </div>
          );
        })}
      </div>

      <div className="advanced-skills-container"></div>
    </div>
  );
}
