package com.rpgapp.rpg_webapp.character;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CharacterDetailsDTO {
  private Long characterId;
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

  private String campaignName;
  private String campaignYear;
  private String dmName;
  private Integer totalExp;
  private Integer currentExp;
  private Integer gold;
  private Integer silver;
  private Integer bronze;

  private Attribute attributes;
  private Skills skills;
  private List<Weapons> weapons;
  private List<Armor> armor;
  private List<Items> talents;
  private List<Items> equipment;

  private String backstory;
  private String notes;
}
