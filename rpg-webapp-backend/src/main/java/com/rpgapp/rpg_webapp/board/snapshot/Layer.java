package com.rpgapp.rpg_webapp.board.snapshot;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class Layer {
    private String id;
    private int z;
    private boolean visible = true;
    private boolean locked = false;

    private List<StrokeObject> objects = new ArrayList<>();
}
