package com.rpgapp.rpg_webapp.character;

import lombok.Data;

@Data
public class CharacterBasicDTO {
    private long characterId;
    private String name;
    private byte[] characterImage;

    public CharacterBasicDTO(long characterId, String name, byte[] characterImage){
        this.characterId = characterId;
         this.name = name;
         this.characterImage = characterImage;
    }
}
