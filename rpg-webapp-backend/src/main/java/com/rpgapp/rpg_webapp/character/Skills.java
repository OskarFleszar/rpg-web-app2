package com.rpgapp.rpg_webapp.character;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Embeddable
@Data
public class Skills {

    public enum SkillLevel {
        NOT_PURCHASED, // Niewykupiona
        PURCHASED,     // Wykupiona
        PLUS_10,       // +10
        PLUS_20        // +20
    }

    public enum SkillType {
        BASIC,         // Umiejętności podstawowe
        ADVANCED       // Umiejętności zaawansowane
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @MapKeyColumn(name = "skill_name")
    @Column(name = "skill_info")
    private Map<String, SkillInfo> skills = new HashMap<>();

    @Data
    @NoArgsConstructor
    @Embeddable
    public static class SkillInfo {
        private SkillLevel level;
        private SkillType type;

        public SkillInfo(SkillLevel level, SkillType type) {
            this.level = level;
            this.type = type;
        }
    }

    public Skills() {
        initializeBasicSkills();
    }

    private void initializeBasicSkills() {
        addSkill("Disguise", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Command", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Gamble", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Ride", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Consume Alcohol", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Animal Care", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Gossip", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Swim", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Drive", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Charm", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Search", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Silent Move", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Perception", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Outdoor Survival", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Haggle", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Concealment", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Row", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Scale Sheer Surface", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Evaluate", SkillLevel.NOT_PURCHASED, SkillType.BASIC);
        addSkill("Intimidate", SkillLevel.NOT_PURCHASED, SkillType.BASIC);

    }

    public void addSkill(String skillName, SkillLevel level, SkillType type) {
        skills.put(skillName, new SkillInfo(level, type));
    }

    public void updateSkillLevel(String skillName, SkillLevel level) {
        if (skills.containsKey(skillName)) {
            skills.get(skillName).setLevel(level);
        }
    }

    public SkillLevel getSkillLevel(String skillName) {
        return skills.containsKey(skillName) ? skills.get(skillName).getLevel() : SkillLevel.NOT_PURCHASED;
    }

    public SkillType getSkillType(String skillName) {
        return skills.containsKey(skillName) ? skills.get(skillName).getType() : null;
    }
}
