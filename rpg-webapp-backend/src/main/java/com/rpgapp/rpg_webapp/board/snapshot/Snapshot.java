// board/snapshot/Snapshot.java
package com.rpgapp.rpg_webapp.board.snapshot;

import lombok.Getter; import lombok.Setter; import lombok.NoArgsConstructor;
import java.util.*;

@Getter @Setter @NoArgsConstructor
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
    // ⬇️ brakujące przeciążenie
    public Layer getOrCreateLayer(String id) {
        return getOrCreateLayer(id, 0);
    }

    public void addStroke(String layerId, StrokeObject s) {
        Layer l = getOrCreateLayer(layerId, 10);
        l.getObjects().add(s);
    }

    public void addShape(String layerId, ShapeObject obj) {
        Layer l = getOrCreateLayer(layerId, 10);
        l.getObjects().add(obj);
    }

    public boolean appendPoints(String pathId, List<int[]> pts) {
        for (Layer l : layers) {
            for (BoardObject o : l.getObjects()) {
                if (o instanceof StrokeObject so &&
                        Objects.equals(so.getPathId(), pathId)) {

                    for (int[] p : pts) {
                        if (p.length >= 2) {
                            so.getPoints().add(p[0]);
                            so.getPoints().add(p[1]);
                        }
                    }
                    return true;
                }
            }
        }
        return false;
    }

    public boolean removeObject(String objectId) {
        for (Layer l : layers) {
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

    public boolean containsObject(String objectId) {
        for (Layer l : layers) {
            for (BoardObject o : l.getObjects()) {
                if (Objects.equals(objectId, o.getObjectId())) return true;
            }
        }
        return false;
    }
}
