package com.rpgapp.rpg_webapp.board.dto;

import java.util.List;

public record TransformChangeDTO(
        String id,            // UUID (string)
        String kind,          // "stroke" | "rect" | "ellipse"
        // dla stroke:
        List<Integer> points,
        // dla rect/ellipse:
        Double x, Double y, Double width, Double height,
        Double rotation
) {}