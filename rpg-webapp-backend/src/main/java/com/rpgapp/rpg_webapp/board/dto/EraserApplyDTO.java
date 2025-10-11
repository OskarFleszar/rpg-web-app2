// board/dto/EraserApplyDTO.java
package com.rpgapp.rpg_webapp.board.dto;

import java.util.List;

public record EraserApplyDTO(
        String type,
        long boardId,
        float radius,
        List<int[]> points
) implements BoardOpDTO { }
