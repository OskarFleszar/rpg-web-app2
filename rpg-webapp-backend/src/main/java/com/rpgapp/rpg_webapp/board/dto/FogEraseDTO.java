package com.rpgapp.rpg_webapp.board.dto;

public record FogEraseDTO(
        String campaignId,
        long boardId,
        String pathId,
        int radius,
        int chunkIndex,
        boolean isLast,
        int[] points,
        String clientId,
        String layerId
) {}
