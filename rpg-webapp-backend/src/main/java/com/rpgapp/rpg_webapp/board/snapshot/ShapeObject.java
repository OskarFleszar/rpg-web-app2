package com.rpgapp.rpg_webapp.board.snapshot;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShapeObject {
    private String type = "shape";        // stałe: to jest obiekt-kształt w snapshotcie
    private String objectId;              // = dto.id().toString()
    private String shape;                 // "rect" | "ellipse"

    private String color;
    private int strokeWidth;                    // grubość konturu (uwaga: nazwa "width" = stroke width)
    private double x;
    private double y;

    // RECT:
    private Double width;
    private Double height;

    private Double rotation;              // opcjonalnie
    private Long ownerId;
    private java.time.LocalDateTime createdAt;

    // gettery/settery
}