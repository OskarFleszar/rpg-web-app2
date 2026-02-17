package com.rpgapp.rpg_webapp.board.dto;

import java.util.List;

public record FogEraseDTO(
        String campaignId,
        long boardId,
        String pathId,
        int radius,
        double[][] points,
        String clientId,

        String layerId
) {}

