package com.rpgapp.rpg_webapp.character.dto;

// package com.rpgapp.rpg_webapp.character;

import lombok.Data;
import java.util.Map;

import com.rpgapp.rpg_webapp.character.Skills.SkillInfo;

@Data
public class ChatCharacterDTO {
    private long characterId;
    private String name;
    private Map<String, SkillInfo> skills;

    public ChatCharacterDTO(long characterId, String name, Map<String, SkillInfo> skills) {
        this.characterId = characterId;
        this.name = name;
        this.skills = skills;
    }
}

