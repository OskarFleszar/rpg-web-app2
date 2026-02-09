package com.rpgapp.rpg_webapp.character;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.rpgapp.rpg_webapp.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Builder
@Table(name = "character")
public class Character {

    @Id
    @SequenceGenerator(name = "character_sequence", sequenceName = "character_sequence", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "character_sequence")
    private Long characterId;

    // Podstawowe informacje o postaci
    private String name;
    private String race;
    private String currentProfession;
    private String lastProfession;
    private Integer age;
    private String gender;
    private String eyeColor;
    private Integer weight;
    private String hairColor;
    private Integer height;
    private String starSign;
    private Integer siblings;
    private String birthPlace;
    private String specialSigns;

    //
    private String campaignName;
    private String campaignYear;
    private String dmName;
    private Integer totalExp;
    private Integer currentExp;
    private Integer gold;
    private Integer silver;
    private Integer bronze;

    @Embedded
    private Attribute attributes;

    private Integer currentHealth;

    @Embedded
    private Skills skills;

    @ElementCollection
    private List<Weapons> weapons;

    @ElementCollection
    private List<Armor> armor;

    @ElementCollection
    private List<Items> talents;

    @ElementCollection
    private List<Items> equipment;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "spell_card_id")
    @JsonManagedReference
    private SpellCard spellCard;

    private String backstory;

    private String notes;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @JsonIgnore
    private byte[] characterImage;

    @JsonIgnore
    private String imageType;

    public Character(String name, String race, String currentProfession, String lastProfession, Integer age,
            String gender, String eyeColor, Integer weight, String hairColor, Integer height, String starSign,
            Integer siblings, String birthPlace, String specialSigns, String campaignName, String campaignYear,
            String dmName, Integer totalExp, Integer currentExp, Integer gold, Integer silver, Integer bronze,
            Attribute attributes, Skills skills, List<Weapons> weapons, List<Armor> armor, List<Items> talents,
            List<Items> equipment, String backstory, String notes, User user, byte[] characterImage, String imageType,
            SpellCard spellCard, Integer currentHealth) {
        this.name = name;
        this.race = race;
        this.currentProfession = currentProfession;
        this.lastProfession = lastProfession;
        this.age = age;
        this.gender = gender;
        this.eyeColor = eyeColor;
        this.weight = weight;
        this.hairColor = hairColor;
        this.height = height;
        this.starSign = starSign;
        this.siblings = siblings;
        this.birthPlace = birthPlace;
        this.specialSigns = specialSigns;
        this.campaignName = campaignName;
        this.campaignYear = campaignYear;
        this.dmName = dmName;
        this.totalExp = totalExp;
        this.currentExp = currentExp;
        this.gold = gold;
        this.silver = silver;
        this.bronze = bronze;
        this.attributes = attributes;
        this.skills = skills;
        this.weapons = weapons;
        this.armor = armor;
        this.talents = talents;
        this.equipment = equipment;
        this.backstory = backstory;
        this.notes = notes;
        this.user = user;
        this.characterImage = characterImage;
        this.imageType = imageType;
        this.spellCard = spellCard;
        this.currentHealth = currentHealth;
    }
}
