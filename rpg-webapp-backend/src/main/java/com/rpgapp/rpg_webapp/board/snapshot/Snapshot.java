package com.rpgapp.rpg_webapp.board.snapshot;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
public class Snapshot {

    private long version = 0;
    private List<Layer> layers = new ArrayList<>();

    public Layer getOrCreateLayer(String id, int z) {
        for (Layer l : layers) if (Objects.equals(l.getId(), id)) return l;
        Layer l = new Layer();
        l.setId(id);
        l.setZ(z);
        l.setVisible(true);
        l.setLocked(false);
        layers.add(l);
        return l;
    }

    public void addStroke(String layerId, StrokeObject s) {
        Layer l = getOrCreateLayer(layerId, 10);
        l.getObjects().add(s);
    }

    public boolean appendPoints(String pathId, List<int[]> pts){
        for (Layer l : layers){
            for (var obj : l.getObjects()) {
                if ("stroke".equals(obj.getType()) && Objects.equals(obj.getPathId(), pathId)) {
                    for (int[] p : pts) {
                        if (p.length >= 2) {
                            obj.getPoints().add(p[0]);
                            obj.getPoints().add(p[1]);
                        }
                    }
                    return true;
                }
            }
        }
        return  false;
    }

    public boolean removeObject(String objectId) {
        for(Layer l : layers) {
            var it = l.getObjects().iterator();
            while (it.hasNext()) {
                var o = it.next();
                if (Objects.equals(objectId, o.getObjectId())) {
                    it.remove();
                    return true;
                }
            }
        }
        return false;
    }
}
