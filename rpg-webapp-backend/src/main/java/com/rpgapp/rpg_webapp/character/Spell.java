package com.rpgapp.rpg_webapp.character;


import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Spell {
    private String spellName;
    private Integer powerLevel;
    private Integer castTime;
    private String ingredient;
    private String description;
}
