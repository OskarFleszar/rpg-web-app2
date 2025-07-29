package com.rpgapp.rpg_webapp.character;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
@Embeddable
public class Items {

    private String name;
    private String description;
}
