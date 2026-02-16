package com.rpgapp.rpg_webapp.board.dto;

import java.util.List;

public record FogEraseDTO(
        String type,

        String campaignId,
        long boardId,
        String pathId,
        double radius,
        double[][] points,
        String clientId
) {}

