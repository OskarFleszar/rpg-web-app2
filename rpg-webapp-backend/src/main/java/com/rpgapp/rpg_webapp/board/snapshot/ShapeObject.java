package com.rpgapp.rpg_webapp.board.snapshot;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShapeObject extends BoardObject{

    
    private String shape;

    private String color;
    private int strokeWidth;
    private double x;
    private double y;


    private Double width;
    private Double height;

    private Double rotation;            

}