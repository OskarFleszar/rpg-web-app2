package com.rpgapp.rpg_webapp.board;

import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rpgapp.rpg_webapp.board.dto.*;
import com.rpgapp.rpg_webapp.board.entity.Board;
import com.rpgapp.rpg_webapp.board.repositories.BoardRepository;
import com.rpgapp.rpg_webapp.user.User;
import com.rpgapp.rpg_webapp.user.UserRepository;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.*;

@Controller
public class BoardWsController {

    private final SimpMessagingTemplate broker;
    private final BoardService service;
    private final ObjectMapper mapper;
    private final UserRepository users;
    private final BoardRepository boards;

    public BoardWsController(SimpMessagingTemplate broker, BoardService service, ObjectMapper mapper,
                             UserRepository users, BoardRepository boards) {
        this.broker = broker;
        this.service = service;
        this.mapper = mapper;
        this.users = users;
        this.boards = boards;
    }

    @MessageMapping("/board.{id}.op")
    public void onOp(@DestinationVariable long id,
                     @Payload Map<String, Object> body,
                     Principal principal) throws Exception {

        if (principal == null) return;
        Long userId = Long.valueOf(principal.getName());
        Optional<Board> b = boards.findById(id);
        Board board = boards.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + id));

    

        String type = String.valueOf(body.get("type"));
        switch (type) {
            case "stroke.start" -> {
                var dto = mapper.convertValue(body, StrokeStartDTO.class);
                if (dto.layerId() == null || dto.pathId() == null) return;

                User owner = users.findById(userId).orElse(null);
                if (owner == null) return;

                service.handleStrokeStart(dto, owner);
                broker.convertAndSend("/topic/board." + id + ".op", body);
            }
            case "stroke.append" -> {
                var dto = mapper.convertValue(body, StrokeAppendDTO.class);
                if (dto.points() != null && dto.points().size() > 256) return;
                service.handleStrokeAppend(dto);
                broker.convertAndSend("/topic/board." + id + ".op", body);
            }
            case "stroke.end" -> {
                var dto = mapper.convertValue(body, StrokeEndDTO.class);
                service.handleStrokeEnd(dto);
                broker.convertAndSend("/topic/board." + id + ".op", body);
            }
            case "object.remove" -> {
                var dto = mapper.convertValue(body, ObjectRemoveDTO.class);
                UUID oid;
                try {
                    oid = UUID.fromString(dto.objectId());
                } catch (Exception e) {
                    return;
                }

                boolean isOwner = service.isOwner(oid, userId);
                boolean isGm = false; 
                if (!(isOwner || isGm)) return;

                if (service.removeObject(id, oid)) {
                    broker.convertAndSend("/topic/board." + id + ".op", body);
                }
            }
            case "erase.commit" -> {
                var ids = (List<String>) body.get("objectIds");
                var uuids = ids.stream().map(UUID::fromString).toList();
                var owner = users.findUserById(userId).orElseThrow();
                var isGM = body.get("isGM");

                var removed = service.eraseCommit(id, uuids, owner, (Boolean) isGM);

                var out = Map.of(
                        "type", "erase.applied",
                        "boardId", id,
                        "removed", removed.stream().map(r -> Map.of(
                                "layerId", r.layerId(),
                                "object", r.object()
                        )).toList(),
                        "clientId", body.get("clientId")
                );
                broker.convertAndSend("/topic/board." + id + ".op", out);
            }
            case "erase.undo" -> {
                var ids = (List<String>) body.get("objectIds");
                var uuids = ids.stream().map(UUID::fromString).toList();
                var owner = users.findUserById(userId).orElseThrow();
                var isGM = body.get("isGM");

                var restored = service.eraseUndo(id, uuids, owner, (Boolean) isGM);

                var out = Map.of(
                        "type", "erase.undo.applied",
                        "boardId", id,
                        "restored", restored.stream().map(r -> Map.of(
                                "layerId", r.layerId(),
                                "object", r.object()
                        )).toList(),
                        "clientId", body.get("clientId")
                );
                broker.convertAndSend("/topic/board." + id + ".op", out);
            }
            case "shape.add" -> {
                var dto = mapper.convertValue(body.get("shape"), ShapeDTO.class);
                if (dto == null) return;

                var lid = (String) body.get("layerId");
                if (dto.layerId() == null && lid != null) {
                    dto = new ShapeDTO(
                            dto.id(), lid, dto.type(), dto.color(), dto.strokeWidth(),
                            dto.x(), dto.y(), dto.width(), dto.height(), dto.rotation()
                    );
                }

                var owner = users.findUserById(userId).orElse(null);
                if (owner == null) return;

                service.addShape(id, dto, owner);
                broker.convertAndSend("/topic/board." + id + ".op", body);
            }
            case "board.clearAll" -> {
                var who = users.findById(userId).orElse(null);
                service.clearBoardHard(board.getId(), who);

                var out = new HashMap<String, Object>();
                out.put("type", "board.cleared");
                out.put("boardId", id);
                var clientId = (String) body.get("clientId");
                if (clientId != null && !clientId.isBlank()) out.put("clientId", clientId);

                broker.convertAndSend("/topic/board." + id + ".op", out);
            }

            case "transform.apply" -> {

                var dto = mapper.convertValue(body, TransformApplyDTO.class);
                if (dto == null || dto.changed() == null || dto.changed().isEmpty()) return;

                var who  = users.findUserById(userId).orElseThrow();
              
                boolean isGM = Boolean.TRUE.equals(body.get("isGM"));

              
                var applied = service.applyTransforms(id, dto.changed(), who, isGM);

                
                var out = new HashMap<String, Object>();
                out.put("type", "transform.applied");
                out.put("boardId", id);
                out.put("changed", applied.stream().map(ch -> {
                    var m = new HashMap<String, Object>();
                    m.put("id", ch.id());
                    m.put("kind", ch.kind());
                    if ("stroke".equals(ch.kind())) {
                        m.put("points", ch.points());
                    } else {
                        m.put("x", ch.x());
                        m.put("y", ch.y());
                        m.put("width", ch.width());
                        m.put("height", ch.height());
                        if (ch.rotation() != null) m.put("rotation", ch.rotation());
                    }
                    return m;
                }).toList());

                if (dto.clientId() != null && !dto.clientId().isBlank()) {
                    out.put("clientId", dto.clientId());
                }

                broker.convertAndSend("/topic/board." + id + ".op", out);
            }

        case "change.board" -> {
            var boardIdRaw = body.get("boardId");
            var campaignIdRaw = body.get("campaignId");

            Long boardId = Long.valueOf(boardIdRaw.toString());
            Long campaignId = Long.valueOf(campaignIdRaw.toString());

            var out = new HashMap<String, Object>();
            out.put("type", "change-board");
            out.put("boardId", boardId);

            service.changeBoard(campaignId, boardId);

            broker.convertAndSend("/topic/board." + id + ".op", out);
        }





            default -> { /* ignore unknown */ }
        }
    }

    @MessageMapping("/campaign.{campaignId}.op")
public void onOp(@DestinationVariable Long campaignId,
                 @Payload Map<String, Object> body,
                 Principal principal) {
    String type = Objects.toString(body.get("type"), "");
    switch (type) {
        case "change.board" -> {
            Long boardId = Long.valueOf(body.get("boardId").toString());
            // opcjonalnie: persistuj activeBoard w DB
            service.changeBoard(campaignId, boardId);

            var out = new HashMap<String, Object>();
            out.put("type", "change-board");
            out.put("boardId", boardId);

            // KLUCZ: broadcast po temacie kampanii
            broker.convertAndSend("/topic/campaign." + campaignId + ".op", out);
        }
        // ...
    }
}
}