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

        // TODO: authorize user vs b.get().getCampaign()

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
                boolean isGm = false; // TODO: sprawdź rolę GM względem kampanii boarda
                if (!(isOwner || isGm)) return;

                if (service.removeObject(id, oid)) {
                    broker.convertAndSend("/topic/board." + id + ".op", body);
                }
            }
            case "erase.commit" -> {
                EraseCommitDTO dto = mapper.convertValue( body, EraseCommitDTO.class);
                if (dto.objectIds() == null || dto.objectIds().isEmpty()) return;

                List<UUID> removed = new ArrayList<>();
                for (String s : dto.objectIds()) {
                    UUID oid;
                    try {
                        oid = UUID.fromString(s);
                    } catch (Exception e) {
                        continue;
                    }

                    boolean isOwner = service.isOwner(oid, userId);
                    boolean isGm = false; // TODO: GM kampanii boarda
                    if (!(isOwner || isGm)) continue;

                    if (service.removeObject(id, oid)) {
                        removed.add(oid);
                    }
                }
                if (!removed.isEmpty()) {
                    broker.convertAndSend("/topic/board." + id + ".op", Map.of(
                            "type", "objects.removed",
                            "objectIds", removed
                    ));
                }
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


            default -> { /* ignore unknown */ }
        }
    }
}