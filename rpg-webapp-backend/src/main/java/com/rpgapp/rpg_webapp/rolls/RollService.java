package com.rpgapp.rpg_webapp.rolls;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.CampaignRepository;
import com.rpgapp.rpg_webapp.character.*;
import com.rpgapp.rpg_webapp.character.Character;
import com.rpgapp.rpg_webapp.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RollService {

    private final RollRepository rollRepository;
    private final CharacterService characterService;
    private final CampaignRepository campaignRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CharacterRepository characterRepository;

    @Autowired
    public RollService(RollRepository rollRepository, CharacterService characterService, CampaignRepository campaignRepository, SimpMessagingTemplate messagingTemplate, CharacterRepository characterRepository) {
        this.rollRepository = rollRepository;
        this.characterService = characterService;
        this.campaignRepository = campaignRepository;
        this.messagingTemplate = messagingTemplate;
        this.characterRepository = characterRepository;
    }

    public int diceRoll(int sides) {
        return (int) (Math.random() * sides) + 1;
    }

    public int getSides(String diceType) {
        return switch (diceType) {
            case "d4" -> 4;
            case "d6" -> 6;
            case "d8" -> 8;
            case "d10" -> 10;
            case "d12" -> 12;
            case "d20" -> 20;
            case "d100" -> 100;
            default -> throw new IllegalArgumentException("Unknown dice type: " + diceType);
        };
    }

    public boolean getRollOutcome(Character character, Roll roll) {
        String rollFor = roll.getRollFor();
        Skills.SkillLevel SkillLevel = character.getSkills().getSkillLevel(rollFor);
        double dzielnik = 1;
        int dodatek = 0;
        int bonus = roll.getBonus();

        switch (SkillLevel){
            case NOT_PURCHASED -> dzielnik = 2;
            case PLUS_10 -> dodatek = 10;
            case PLUS_20 -> dodatek = 20;
        }

        int totalBonus = dodatek + bonus;
        if(totalBonus > 30) totalBonus = 30;
        else if (totalBonus < -30) {
            totalBonus = -30;
        }


        return switch (rollFor) {
            case "Disguise","Command","Gossip","Charm","Haggle" -> {
                Attribute.Attributes FellowshipAttribute = character.getAttributes().getAttributes().get("Fellowship");
                int FellowshipValue = FellowshipAttribute.getCurrentValue();
                yield roll.getRollResult() <= ((FellowshipValue/dzielnik)+totalBonus);
            }
            case "Gamble","Animal Care","Search","Outdoor Survival","Evaluate","Perception" -> {
                Attribute.Attributes intelligenceAttribute = character.getAttributes().getAttributes().get("Intelligence");
                int intelligenceValue = intelligenceAttribute.getCurrentValue();
                yield roll.getRollResult() <= ((intelligenceValue/dzielnik)+totalBonus);
            }
            case "Ride","Silent Move","Concealment" -> {
                Attribute.Attributes AgilityAttribute = character.getAttributes().getAttributes().get("Agility");
                int AgilityValue = AgilityAttribute.getCurrentValue();
                yield roll.getRollResult() <= ((AgilityValue/dzielnik)+totalBonus);
            }
            case "Consume Alcohol" -> {
                Attribute.Attributes ToughnessAttribute = character.getAttributes().getAttributes().get("Toughness");
                int ToughnessValue = ToughnessAttribute.getCurrentValue();
                yield roll.getRollResult() <= ((ToughnessValue/dzielnik)+totalBonus);
            }
            case "Swim","Drive","Row","Scale Sheer Surface","Intimidate" -> {
                Attribute.Attributes StrengthAttribute = character.getAttributes().getAttributes().get("Strength");
                int StrengthValue = StrengthAttribute.getCurrentValue();
                yield roll.getRollResult() <= ((StrengthValue/dzielnik)+totalBonus);
            }
            default -> throw new IllegalArgumentException("Unknown rollFor: " + rollFor);
        };
    }


    public void rollTheDiceWs(Roll roll, Long campaignId, SimpMessageHeaderAccessor headerAccessor) {
        User user = characterService.getCurrentUserWS(headerAccessor);
        roll.setUser(user);

        Long characterId = roll.getCharacterId();
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalArgumentException("Character not found"));

        int numberOfDice = roll.getNumberOfDice();
        int sides = getSides(roll.getRollType());
        List<Integer> singleDiceRolls = new ArrayList<>();
        int result = 0;

        for (int i = 0; i < numberOfDice; i++) {
            int singleResult = diceRoll(sides);
            singleDiceRolls.add(singleResult);
            result += singleResult;
        }

        roll.setSingleDiceResult(singleDiceRolls);
        roll.setRollResult(result);
        roll.setRollTime(LocalDateTime.now());


        if(!roll.getRollFor().equals("Other")) {
            String outcome = getRollOutcome(character, roll) ? "success" : "fail";
            roll.setOutcome(outcome);
        }
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        roll.setCampaign(campaign);

        Roll savedRoll = rollRepository.save(roll);
        messagingTemplate.convertAndSend("/chatroom/" + campaignId, savedRoll);
    }





    public void rollTheDice(Roll roll, Long campaignId) {
        int numberOfDice = roll.getNumberOfDice();
        int sides = getSides(roll.getRollType());
        List<Integer> singleDiceRolls = new ArrayList<>();
        int result = 0;


        for (int i = 0; i < numberOfDice; i++) {
            int singleResult = diceRoll(sides);
            singleDiceRolls.add(singleResult);
            result += singleResult;
        }


        roll.setSingleDiceResult(singleDiceRolls);
        roll.setRollResult(result);
        roll.setRollTime(LocalDateTime.now());


        User user = characterService.getCurrentUser();


        if (campaignRepository.existsByUserAndCampaign(user.getUserId(), campaignId)) {
            roll.setUser(user);

            Campaign campaign = campaignRepository.findById(campaignId)
                    .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
            roll.setCampaign(campaign);

            rollRepository.save(roll);
        } else {
            throw new IllegalStateException("User is not part of this campaign");
        }
    }



}
