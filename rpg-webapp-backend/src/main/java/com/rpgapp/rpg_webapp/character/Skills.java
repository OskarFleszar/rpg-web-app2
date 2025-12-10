package com.rpgapp.rpg_webapp.character;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rpgapp.rpg_webapp.rolls.Roll;

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

    public enum RollFor {
        Fellowship,
        Intelligence,
        Agility,
        Toughness,
        Strength,
        Willpower,
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @MapKeyColumn(name = "skill_name")
    @Column(name = "skill_info")
    @JsonIgnore
    @Getter(AccessLevel.NONE)
    private Map<String, SkillInfo> skills = new HashMap<>();

    @Data
    @NoArgsConstructor
    @Embeddable
    public static class SkillInfo {
        private SkillLevel level;
        private SkillType type;
        private RollFor rollFor;

        public SkillInfo(SkillLevel level, SkillType type, RollFor rollFor) {
            this.level = level;
            this.type = type;
            this.rollFor = rollFor;
        }
    }

    @JsonAnyGetter
    public Map<String, SkillInfo> any() {
        return skills;
    }


    @JsonAnySetter
    public void set(String name, SkillInfo value) {
        skills.put(name, value);
    }

    public Skills() {
        initializeBasicSkills();
    }

    private void initializeBasicSkills() {
        addSkill("Disguise", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Fellowship);
        addSkill("Command", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Fellowship);
        addSkill("Gamble", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Intelligence);
        addSkill("Ride", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Agility);
        addSkill("Consume Alcohol", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Toughness);
        addSkill("Animal Care", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Intelligence);
        addSkill("Gossip", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Fellowship);
        addSkill("Swim", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Strength);
        addSkill("Drive", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Strength);
        addSkill("Charm", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Fellowship);
        addSkill("Search", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Intelligence);
        addSkill("Silent Move", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Agility);
        addSkill("Perception", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Intelligence);
        addSkill("Outdoor Survival", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Intelligence);
        addSkill("Haggle", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Fellowship);
        addSkill("Concealment", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Agility);
        addSkill("Row", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Strength);
        addSkill("Scale Sheer Surface", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Strength);
        addSkill("Evaluate", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Intelligence);
        addSkill("Intimidate", SkillLevel.NOT_PURCHASED, SkillType.BASIC, RollFor.Strength);

    }

    public void addSkill(String skillName, SkillLevel level, SkillType type, RollFor rollFor) {
        skills.put(skillName, new SkillInfo(level, type, rollFor));
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

    public RollFor getRollFor(String rollFor) {
        return skills.containsKey(rollFor) ? skills.get(rollFor).getRollFor() : null;
    }
}
