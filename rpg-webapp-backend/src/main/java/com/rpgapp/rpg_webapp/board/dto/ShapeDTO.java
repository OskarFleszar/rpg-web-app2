package com.rpgapp.rpg_webapp.board.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;
public record ShapeDTO(
        UUID id,
        String layerId,
        String type,          // "rect" | "ellipse"
        String color,
        Integer strokeWidth,  // grubość konturu (z frontu może się nazywać strokeWidth)
        Double x,
        Double y,

        // RECT:
        Double width,
        Double height,

        // opcjonalnie:
        Double rotation
) {}

