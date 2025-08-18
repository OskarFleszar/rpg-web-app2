package com.rpgapp.rpg_webapp.character;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rpgapp.rpg_webapp.character.Skills.SkillInfo;

@Data
@Embeddable
public class Attribute {

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    @Embeddable
    public static class Attributes {
        private int baseValue;
        private int advancementPoints;
        private int currentValue;
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @MapKeyColumn(name = "attribute_name")
    @Column(name = "attribute")
    @JsonIgnore
    @Getter(AccessLevel.NONE)
    private Map<String, Attributes> attributes = new HashMap<>();

    @JsonAnyGetter
    public Map<String, Attributes> any() {
        return attributes;
    }

    
    @JsonIgnore
    public Map<String, Attribute.Attributes> getAttributes() {
        return attributes; 
    }

    
    @JsonAnySetter
    public void set(String name, Attributes value) {
        attributes.put(name, value);
    }

    public Attribute() {
        initializeAttributes();
    }


    private void initializeAttributes() {
        addAttribute("Weapon Skill", new Attributes());       // Umiejętności walki wręcz (WW)
        addAttribute("Ballistic Skill", new Attributes());     // Umiejętności strzeleckie (US)
        addAttribute("Strength", new Attributes());             // Krzepa (K)
        addAttribute("Toughness", new Attributes());           // Odpornosc (Odp)
        addAttribute("Agility", new Attributes());              // Zręczność (Zr)
        addAttribute("Intelligence", new Attributes());         // Inteligencja (Int)
        addAttribute("Willpower", new Attributes());            // Siła woli (SW)
        addAttribute("Fellowship", new Attributes());           // Ogłada (Ogd)


        addAttribute("Attacks", new Attributes());              // Ataki (A)
        addAttribute("Health", new Attributes());               // Punkty żywotności (Zyw)
        addAttribute("Magic", new Attributes());                // Magia (M)
        addAttribute("Madness Points", new Attributes());       // Punkty obłędu (PO)
        addAttribute("Fate Points", new Attributes());          // Punkty przeznaczenia (PP)
    }



    public void addAttribute(String attributeName, Attributes attributes) {
        this.attributes.put(attributeName, attributes);
    }


    public void updateAttribute(String attributeName, int baseValue, int advancementPoints, int currentValue) {
       if(attributes.containsKey(attributeName)) {
           attributes.get(attributeName).setBaseValue(baseValue);
           attributes.get(attributeName).setCurrentValue(currentValue);
           attributes.get(attributeName).setAdvancementPoints(advancementPoints);
       }
    }
}
