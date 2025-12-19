package com.rpgapp.rpg_webapp.board.snapshot;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TokenObject extends BoardObject {
  
  private Long characterId;
  private int col;
  private int row;
}
