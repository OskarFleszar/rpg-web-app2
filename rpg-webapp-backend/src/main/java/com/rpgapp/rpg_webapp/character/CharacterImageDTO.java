package com.rpgapp.rpg_webapp.character;

import lombok.Data;

@Data
public class CharacterImageDTO {
    
    private byte[] characterImage;
    private String imageType;

    public CharacterImageDTO( byte[] characterImage, String imageType){
         this.characterImage = characterImage;
         this.imageType = imageType;
    }
}
