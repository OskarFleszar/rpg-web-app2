package com.rpgapp.rpg_webapp.character;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "spell_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpellCard {

    @Id
    @SequenceGenerator(
            name = "spell_card_sequence",
            sequenceName = "spell_card_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "spell_card_sequence"
    )
    private Long spellCardId;

    @OneToOne(mappedBy = "spellCard")
    @JsonBackReference
    private Character character;

    @ElementCollection
    @CollectionTable(
            name = "spell_card_spells",
            joinColumns = @JoinColumn(name = "spell_card_id")
    )
    private List<Spell> spells = new ArrayList<>();
}
