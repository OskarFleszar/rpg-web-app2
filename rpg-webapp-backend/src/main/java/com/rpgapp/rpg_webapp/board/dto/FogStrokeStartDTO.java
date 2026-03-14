package com.rpgapp.rpg_webapp.board.dto;

public record FogStrokeStartDTO(String type, long boardId, String layerId, String pathId,  float width) implements BoardOpDTO {
}
