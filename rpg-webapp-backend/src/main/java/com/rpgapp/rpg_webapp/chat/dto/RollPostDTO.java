package com.rpgapp.rpg_webapp.chat.dto;
public record RollPostDTO(
        String rollType, String rollFor, Integer numberOfDice,
        Integer bonus, Long characterId, String clientId, boolean GMRoll
) {}
