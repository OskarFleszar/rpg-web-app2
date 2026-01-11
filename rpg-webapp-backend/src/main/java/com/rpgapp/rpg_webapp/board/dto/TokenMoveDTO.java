package com.rpgapp.rpg_webapp.board.dto;

import java.util.UUID;

public record TokenMoveDTO(UUID id, int col, int row, String layerId) {}

