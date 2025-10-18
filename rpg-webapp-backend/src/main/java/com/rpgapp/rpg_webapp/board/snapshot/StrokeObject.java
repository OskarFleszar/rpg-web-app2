package com.rpgapp.rpg_webapp.board.snapshot;


import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StrokeObject extends BoardObject {
    private String pathId;
    private String color;
    private int width;                 // grubość linii
    private List<Integer> points = new ArrayList<>();
}
