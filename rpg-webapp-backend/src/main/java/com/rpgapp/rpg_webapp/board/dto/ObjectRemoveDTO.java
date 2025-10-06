package com.rpgapp.rpg_webapp.board.dto;

public record ObjectRemoveDTO(String type, long boardId, String objectId) implements BoardOpDTO {
}
