// com.rpgapp.rpg_webapp.board.dto.TransformApplyDTO
package com.rpgapp.rpg_webapp.board.dto;

import java.util.List;

public record TransformApplyDTO(
        Long boardId,
        String clientId,
        Boolean isGM,
        List<TransformChangeDTO> changed
) {}
