package com.rpgapp.rpg_webapp.character;

import jakarta.persistence.Embeddable;
import lombok.*;

@AllArgsConstructor
@Data
@NoArgsConstructor
@Embeddable
public class Weapons {

    private String name;
    private String category;
    private String strength;
    private int range;
    private String weaponAttributes;
}
