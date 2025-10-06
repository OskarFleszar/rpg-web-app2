package com.rpgapp.rpg_webapp.board.snapshot;


import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter @NoArgsConstructor @AllArgsConstructor
public class StrokeObject {

    private String type = "stroke";
    private String objectId;
    private String pathId;
    private String color;
    private float width;
    private List<Integer> points = new ArrayList<>();
    private Long ownerId;
    private LocalDateTime createdAt;

}
