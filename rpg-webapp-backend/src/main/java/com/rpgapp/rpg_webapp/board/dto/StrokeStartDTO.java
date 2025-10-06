package com.rpgapp.rpg_webapp.board.dto;

public record StrokeStartDTO(String type, long boardId, String layerId, String pathId, String color, float width) implements BoardOpDTO {
}
