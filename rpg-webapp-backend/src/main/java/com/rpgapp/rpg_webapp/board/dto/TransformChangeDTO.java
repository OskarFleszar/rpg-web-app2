package com.rpgapp.rpg_webapp.board.dto;

import java.util.List;

public record TransformChangeDTO(
        String id,
        String kind,

        List<Integer> points,

        Double x, Double y, Double width, Double height,
        Double rotation
) {}