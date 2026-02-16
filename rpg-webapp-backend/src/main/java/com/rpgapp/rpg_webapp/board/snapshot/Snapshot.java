// board/snapshot/Snapshot.java
package com.rpgapp.rpg_webapp.board.snapshot;

import lombok.Getter; import lombok.Setter; import lombok.NoArgsConstructor;
import java.util.*;

@Getter @Setter @NoArgsConstructor
public class Snapshot {
    private long version = 0;
    private List<Layer> layers = new ArrayList<>();
    Map<String, TrashEntry> trash = new HashMap<>();
    @Getter @Setter @NoArgsConstructor
     public static class TrashEntry {
        public String layerId;
        public BoardObject object;
        public java.time.LocalDateTime deletedAt;
        public Long ownerId;
    }

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

    public void addToken(String layerId, TokenObject obj) {
        Layer l = getOrCreateLayer(layerId, 20);
        l.getObjects().add(obj);
    }

    public void addFogStroke(String layerId, FogEraseObject s) {
        Layer l = getOrCreateLayer(layerId, 10);
        l.getObjects().add(s);
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


    public static final class ObjView {
        private final String layerId;
        private final Long ownerId;
        private final Object object;
        public ObjView(String layerId, Long ownerId, Object object) {
            this.layerId = layerId; this.ownerId = ownerId; this.object = object;
        }
        public String layerId() { return layerId; }
        public Long ownerId() { return ownerId; }
        public Object object() { return object; }
    }

    public ObjView findObjectById(String objectId) {
        for (var layer : this.layers) {
            for (var o : layer.getObjects()) {
                if (objectId.equals(o.getObjectId())) {
                    return new ObjView(layer.getId(), o.getOwnerId(), o);
                }
            }
        }
        return null;
    }

    public void updateStrokePoints(String objectId, List<Integer> points) {
        for (var layer : this.layers) {
            for (var o : layer.getObjects()) {
                if (objectId.equals(o.getObjectId()) && "stroke".equals(o.getType())) {
                    ((StrokeObject)o).setPoints(points);
                    return;
                }
            }
        }
    }

    public void updateShapeGeometry(String objectId,
                                    double x, double y, double width, double height,
                                    Double rotation) {
        for (var layer : this.layers) {
            for (var o : layer.getObjects()) {
                if (objectId.equals(o.getObjectId()) && "shape".equals(o.getType())) {
                    var so = (ShapeObject)o;
                    so.setX(x); so.setY(y);
                    so.setWidth(width); so.setHeight(height);
                    if (rotation != null) so.setRotation(rotation);
                    return;
                }
            }
        }
    }

    public void updateTokenCell(String objectId, int col, int row) {
         for (var layer : this.layers) {
            for (var o : layer.getObjects()) {
                if (objectId.equals(o.getObjectId()) && "token".equals(o.getType())) {
                    var t = (TokenObject)o;
                    t.setCol(col);
                    t.setRow(row);
                    return;
                }
            }
        }
    }

}
