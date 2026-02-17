package com.rpgapp.rpg_webapp.board.snapshot;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FogEraseObject extends BoardObject{

  private String pathId;
  private double [][] points;
  private int radius;

}
