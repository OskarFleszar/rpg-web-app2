package com.rpgapp.rpg_webapp.board.dto;

import java.util.List;

public record StrokeAppendDTO(String type, long boardId, String pathId, int seq, List<int[]> points ) implements BoardOpDTO {
}
