package com.rpgapp.rpg_webapp.board.dto;

import java.util.List;
import java.util.UUID;


public record ObjectsRemovedEvent(String type, List<UUID> objectIds) {
    public ObjectsRemovedEvent(List<UUID> ids) { this("objects.removed", ids); }
}
