package com.rpgapp.rpg_webapp.board.dto;

public record StrokeEndDTO(String type, long boardId, String pathId)implements BoardOpDTO {
}
