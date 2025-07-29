package com.rpgapp.rpg_webapp.character;

import jakarta.persistence.Embeddable;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Embeddable
public class Armor {

    private String armorType;
    private String location;
    private int armorPoints;
}
