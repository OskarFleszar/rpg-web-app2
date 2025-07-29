package com.rpgapp.rpg_webapp.drawings;

import lombok.Data;
import java.util.List;

@Data
public class DrawingRequest {
    private List<Point> points;
    private String color;
    private int lineWidth;
}
