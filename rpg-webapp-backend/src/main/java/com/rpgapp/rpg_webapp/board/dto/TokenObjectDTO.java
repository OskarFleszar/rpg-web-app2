package com.rpgapp.rpg_webapp.board.dto;

import java.util.UUID;

public record TokenObjectDTO(UUID id, Long characterId, int col, int row, String layerId) {

}
