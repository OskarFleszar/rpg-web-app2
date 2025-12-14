package com.rpgapp.rpg_webapp.character.dto;

import lombok.Data;

@Data
public class CharacterBasicDTO {
    private long characterId;
    private String name;
    private byte[] characterImage;
    private String imageType;

    public CharacterBasicDTO(long characterId, String name, byte[] characterImage, String imageType){
        this.characterId = characterId;
         this.name = name;
         this.characterImage = characterImage;
         this.imageType = imageType;
    }
}
