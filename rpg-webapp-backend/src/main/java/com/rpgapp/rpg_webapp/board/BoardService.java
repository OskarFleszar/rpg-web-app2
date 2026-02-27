package com.rpgapp.rpg_webapp.board;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rpgapp.rpg_webapp.board.dto.*;
import com.rpgapp.rpg_webapp.board.entity.Board;
import com.rpgapp.rpg_webapp.board.entity.BoardObjectIndex;
import com.rpgapp.rpg_webapp.board.entity.BoardState;
import com.rpgapp.rpg_webapp.board.repositories.BoardObjectIndexRepository;
import com.rpgapp.rpg_webapp.board.repositories.BoardRepository;
import com.rpgapp.rpg_webapp.board.repositories.BoardStateRepository;
import com.rpgapp.rpg_webapp.board.snapshot.*;
import com.rpgapp.rpg_webapp.campaign.CampaignService;
import com.rpgapp.rpg_webapp.character.CharacterService;
import com.rpgapp.rpg_webapp.user.User;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BoardService {



    public record RemoveObject (String layerId, BoardObject object){}
    public record RestoredObject (String layerId, BoardObject object){}

    private final BoardRepository boards;
    private final BoardStateRepository states;
    private final BoardObjectIndexRepository indexRepo;
    private final ObjectMapper mapper;
    private final CharacterService characterService;
    private final CampaignService campaignService;

    private final Map<Long, Map<String, List<int[]>>> tempPaths = new ConcurrentHashMap<>();

    private final Map<Long, Map<String, FogChunkBuffer>> tempFogChunks = new ConcurrentHashMap<>();

    private static final class FogChunkBuffer {
        final String layerId;
        final int radius;
        final Long ownerId;
        final Map<Integer, int[]> chunksByIndex = new HashMap<>();
        Integer lastIndex = null;

        FogChunkBuffer(String layerId, int radius, Long ownerId) {
            this.layerId = layerId;
            this.radius = radius;
            this.ownerId = ownerId;
        }
    }


    public BoardService(BoardRepository boards, BoardStateRepository states, BoardObjectIndexRepository indexRepo, ObjectMapper mapper, CharacterService characterService, CampaignService campaignService) {
        this.boards = boards;
        this.states = states;
        this.indexRepo = indexRepo;
        this.mapper = mapper;
        this.characterService = characterService;
        this.campaignService = campaignService;
    }

    private Snapshot readSnapshot(BoardState st) throws Exception {
        if (st.getStateJson() == null || st.getStateJson().isBlank()) {
            return new Snapshot();
        }
        return mapper.readValue(st.getStateJson(), Snapshot.class);
    }    

    private void writeSnapshot(BoardState st, Snapshot snap) throws Exception {
        snap.setVersion(snap.getVersion() + 1);

        st.setStateJson(mapper.writeValueAsString(snap));
    }

    private BoardState getOrCreateState(Long boardId) {
        return states.findById(boardId).orElseGet(() -> {
            Board board = boards.findById(boardId)
                    .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

            BoardState st = new BoardState();
            st.setBoard(board);
            st.setStateJson("{\"version\":0,\"layers\":[]}");

            return states.save(st);
        });
    }

    public void saveBoardBackground(MultipartFile file, long boardId) throws IOException {
        Board board = boards.findById(boardId).orElseThrow();

        board.setImageType(file.getContentType());
        board.setBackgroundImage(file.getBytes());
        boards.save(board);
    }




    @Transactional
    public void handleStrokeStart(StrokeStartDTO dto, User owner) throws Exception {
        tempPaths.computeIfAbsent(dto.boardId(), k -> new ConcurrentHashMap<>())
                .put(dto.pathId(), new ArrayList<>());

        BoardState st = getOrCreateState(dto.boardId());
        Snapshot snap = readSnapshot(st);

        var stroke = StrokeObject.builder()
                .pathId(dto.pathId())
                .build();

        stroke.setType("stroke");
        stroke.setObjectId(dto.pathId());
        stroke.setColor(dto.color());
        stroke.setWidth((int) dto.width());
        stroke.setOwnerId(owner.getId()); 
        stroke.setCreatedAt(LocalDateTime.now());

        if (stroke.getPoints() == null) stroke.setPoints(new ArrayList<>());

        snap.addStroke(dto.layerId(), stroke);
        writeSnapshot(st, snap);
        states.save(st);

        var idx = new BoardObjectIndex();
        idx.setObjectId(UUID.fromString(dto.pathId()));
        idx.setBoard(st.getBoard());
        idx.setOwner(owner);
        idx.setType("stroke");
        idx.setLayerId(dto.layerId());
        idx.setCreatedAt(LocalDateTime.now());
        indexRepo.save(idx);
    }

    public void handleStrokeAppend(StrokeAppendDTO dto) {
        var byPath = tempPaths.computeIfAbsent(dto.boardId(), k -> new ConcurrentHashMap<>());
        var list = byPath.get(dto.pathId());
        if (list != null) list.addAll(dto.points());
    }
    @Transactional
    public void handleStrokeEnd(StrokeEndDTO dto) throws Exception {
        var byPath = tempPaths.get(dto.boardId());
        var pts = (byPath != null) ? byPath.remove(dto.pathId()) : null;
        if (byPath != null && byPath.isEmpty()) {
            tempPaths.remove(dto.boardId());
        }
        if (pts == null || pts.isEmpty()) return;


        BoardState st = getOrCreateState(dto.boardId());
        Snapshot snap = readSnapshot(st);

        log.info("WS stroke.end: boardId={}, pathId={}", dto.boardId(), dto.pathId());
        boolean ok = snap.appendPoints(dto.pathId(), pts);
        if (ok) {
            writeSnapshot(st, snap);
            states.save(st);
        }
    }

    @Transactional
    public boolean removeObject(long boardId, UUID objectId) throws Exception {
     BoardState st = getOrCreateState(boardId);
     Snapshot snap = readSnapshot(st);
     boolean removed = snap.removeObject(objectId.toString());
     if (removed) {
         writeSnapshot(st, snap);
         states.save(st);
         indexRepo.deleteByObjectId(objectId);
     }
     return removed;
    }

    public boolean isOwner(UUID objectId, Long userId){
        return indexRepo.existsByObjectIdAndOwner_UserId(objectId,userId);
    }

    @Transactional
    public String getStateJson(long boardId) throws Exception {
        BoardState st = getOrCreateState(boardId);
        return st.getStateJson();
    }

    @Transactional
    public void addShape(long boardId, ShapeDTO dto, User owner) throws Exception {
        if (dto == null || dto.id() == null || dto.type() == null || dto.layerId() == null) {
            throw new IllegalArgumentException("shape.id, type i layerId są wymagane");
        }
        if(!dto.type().equals("fogcircle") && !dto.type().equals("fogsquare")) {
            if (dto.color() == null || dto.strokeWidth() == null) {
                throw new IllegalArgumentException("shape.color i strokeWidth są wymagane");
            }
        }


        String shapeType = dto.type().toLowerCase();

        switch (shapeType) {
            case "rect", "fogsquare" -> {
                if (dto.width() == null || dto.height() == null) {
                    throw new IllegalArgumentException("rect wymaga width i height");
                }
            }
            case "ellipse", "fogcircle" -> {
                if (dto.width() == null || dto.height() == null) {
                    throw new IllegalArgumentException("ellipse wymaga radiusX i radiusY");
                }
            }
            default -> throw new IllegalArgumentException("Nieobsługiwany shape.type: " + dto.type());
        }

        BoardState st = getOrCreateState(boardId);
        Snapshot snap = readSnapshot(st);

        ShapeObject obj = new ShapeObject();
        obj.setType("shape");
        obj.setObjectId(dto.id().toString());
        obj.setShape(shapeType);
        if(dto.color() != null ) {
            obj.setColor(dto.color());
        }
       if (dto.strokeWidth() != null) {
           obj.setStrokeWidth(dto.strokeWidth());
       }

        obj.setX(dto.x() != null ? dto.x() : 0.0);
        obj.setY(dto.y() != null ? dto.y() : 0.0);
        obj.setRotation(dto.rotation());

        if ("rect".equals(shapeType) || "fogsquare".equals(shapeType)) {
            obj.setWidth(dto.width());
            obj.setHeight(dto.height());
        } else if ("ellipse".equals(shapeType)) {
            obj.setWidth(dto.width());
            obj.setHeight(dto.height());
        }

        obj.setOwnerId(owner.getId());
        obj.setCreatedAt(LocalDateTime.now());

        snap.addShape(dto.layerId(), obj);
        writeSnapshot(st, snap);
        states.save(st);

        var idx = new BoardObjectIndex();
        idx.setObjectId(dto.id());
        idx.setBoard(st.getBoard());
        idx.setOwner(owner);
        idx.setType(shapeType);
        idx.setLayerId(dto.layerId());
        idx.setCreatedAt(java.time.LocalDateTime.now());
        indexRepo.save(idx);
    }
    @Transactional
    public void addToken (long boardId, TokenObjectDTO dto, User owner) throws Exception {
        BoardState st = getOrCreateState(boardId);
        Snapshot snap = readSnapshot(st);

        TokenObject tokenObject = new TokenObject();
        tokenObject.setType("token");
        tokenObject.setObjectId(dto.id().toString());
        tokenObject.setOwnerId(owner.getId());
        tokenObject.setCreatedAt(LocalDateTime.now());
        tokenObject.setRow(dto.row());
        tokenObject.setCol(dto.col());
        tokenObject.setCharacterId(dto.characterId());

        snap.addToken(dto.layerId(),tokenObject);
        writeSnapshot(st, snap);
        states.save(st);

        var idx = new BoardObjectIndex();
        idx.setObjectId(dto.id());
        idx.setBoard(st.getBoard());
        idx.setOwner(owner);
        idx.setType("token");
        idx.setLayerId(dto.layerId());
        idx.setCreatedAt(LocalDateTime.now());
        indexRepo.save(idx);
    }

    @Transactional
    public void moveToken(long boardId, boolean isGM, TokenMoveDTO dto, User owner) throws Exception {
        BoardState st = getOrCreateState(boardId);
        Snapshot snap = readSnapshot(st);

        var obj = snap.findObjectById(dto.id().toString());
        if (obj == null) return;

        Long ownerId = obj.ownerId();
        if (!isGM && (ownerId == null || !Objects.equals(ownerId, owner.getId()))) {
            return;
        }

        snap.updateTokenCell(dto.id().toString(), dto.col(), dto.row());

        writeSnapshot(st, snap);
        states.save(st);
    }

    @Transactional
    public void deleteToken(long boardId, boolean isGM, User owner, UUID id) throws Exception {
        BoardState st = getOrCreateState(boardId);
        Snapshot snap = readSnapshot(st);

        var obj = snap.findObjectById(id.toString());
        if (obj == null) return;

        Long ownerId = obj.ownerId();
        if (!isGM && (ownerId == null || !Objects.equals(ownerId, owner.getId()))) {
            return;
        }

        snap.removeObject(id.toString());

        writeSnapshot(st, snap);
        states.save(st);
    }

    @Transactional
    public List<RemoveObject> eraseCommit(long boardId, List<UUID> ids, User who, boolean isGM) throws Exception {

        var st = getOrCreateState(boardId);
        var snap = readSnapshot(st);

        var removed  = new ArrayList<RemoveObject>();
        var idSet = ids.stream().map(UUID::toString).collect(Collectors.toSet());


        for (var layer : snap.getLayers()){
            var it = layer.getObjects().iterator();
            while (it.hasNext()){
                var obj = it.next();
                if(!idSet.contains(obj.getObjectId())) continue;;


                if(!isGM) {
                    if (!Objects.equals(obj.getOwnerId(), who.getId())) continue;
                }
                it.remove();

                var e = new Snapshot.TrashEntry();
                e.layerId = layer.getId();
                e.object = obj;
                e.deletedAt = java.time.LocalDateTime.now();
                e.ownerId = obj.getOwnerId();
                snap.getTrash().put(obj.getObjectId(), e);

                removed.add(new RemoveObject(layer.getId(), obj));
            }
        }

        if (!removed.isEmpty()) {
            writeSnapshot(st, snap);
            states.save(st);
        }
        return removed;
    }

    @Transactional
    public List<RestoredObject> eraseUndo (long boardId, List<UUID> ids, User who, boolean isGM) throws Exception {

        var st = getOrCreateState(boardId);
        var snap = readSnapshot(st);

        var restored  =new ArrayList<RestoredObject>();

        for (var id : ids) {
            var key = id.toString();
            var e = snap.getTrash().get(key);
            if (e == null) continue;
            if(!isGM) {
                if (!Objects.equals(e.object.getOwnerId(), who.getId())) continue;
            }

            var layer = snap.getLayers().stream()
                    .filter(l -> l.getId().equals(e.layerId))
                    .findFirst().orElse(null);
            if (layer == null) continue;

            layer.getObjects().add(e.object);
            snap.getTrash().remove(key);
            restored.add(new RestoredObject(e.layerId, e.object));
        }

        if (!restored.isEmpty()) {
            writeSnapshot(st, snap);
            states.save(st);
        }
        return restored;
    }

    @Transactional
    public void clearBoardHard(long boardId, User who) throws Exception {


        var st = getOrCreateState(boardId);
        var snap = readSnapshot(st);

        snap.getLayers().forEach(l -> l.getObjects().clear());
        if (snap.getTrash() != null) snap.getTrash().clear();


        snap.setVersion(snap.getVersion() + 1);
        writeSnapshot(st, snap);
        states.save(st);

        indexRepo.deleteByBoardId(boardId);
    }

    public List<TransformChangeDTO> applyTransforms(
            long boardId,
            List<TransformChangeDTO> changes,
            User who,
            boolean isGM
    ) throws Exception {
        if (changes == null || changes.isEmpty()) return List.of();

        var st   = getOrCreateState(boardId);
        var snap = readSnapshot(st);

        var applied = new ArrayList<TransformChangeDTO>();

        for (var ch : changes) {
            if (ch == null || ch.id() == null || ch.kind() == null) continue;
            var objectId = ch.id();

            
            var obj = snap.findObjectById(objectId); 
            if (obj == null) continue;

           
            Long ownerId = obj.ownerId();           
            if (!isGM && (ownerId == null || !Objects.equals(ownerId, who.getId()))) {
                continue;
            }

            switch (ch.kind()) {
                case "stroke" -> {
                    var pts = ch.points();
                    if (pts == null || pts.isEmpty()) continue;
                    snap.updateStrokePoints(objectId, pts); 
                    applied.add(ch);
                }
                case "rect", "ellipse" -> {
                    if (ch.x() == null || ch.y() == null || ch.width() == null || ch.height() == null) continue;
                    snap.updateShapeGeometry(
                            objectId,
                            ch.x(), ch.y(),
                            ch.width(), ch.height(),
                            ch.rotation()
                    ); 
                    applied.add(ch);
                }
                default -> {}
            }
        }

        writeSnapshot(st, snap);
        states.save(st);

        return applied;
    }

    public void changeBoard (Long campaignId, Long boardId) {
        campaignService.changeActiveBoard(campaignId, boardId);
    }

    public void turnFogOnOff (Long campaignId, Long boardId) {
        campaignService.turnFogOnOff(campaignId, boardId);
    }
    @Transactional
    public void addFogStrokeChunk(FogEraseDTO dto, User owner) throws Exception {
        if (dto == null) return;
        if (dto.pathId() == null || dto.pathId().isBlank()) return;
        if (dto.layerId() == null || dto.layerId().isBlank()) return;
        if (dto.points() == null || dto.points().length == 0) return;
        if (dto.points().length % 2 != 0) return;

        // bufor per boardId
        var byPath = tempFogChunks.computeIfAbsent(dto.boardId(), k -> new ConcurrentHashMap<>());

        // bufor per pathId
        var buf = byPath.computeIfAbsent(dto.pathId(),
                pid -> new FogChunkBuffer(dto.layerId(), dto.radius(), owner.getId()));

        int[] maybeAllPoints = null;

        synchronized (buf) {
            buf.chunksByIndex.put(dto.chunkIndex(), dto.points());
            if (dto.isLast()) buf.lastIndex = dto.chunkIndex();

            // jeszcze nie wiemy ile będzie chunków
            if (buf.lastIndex == null) return;

            // czekamy aż dojdą wszystkie 0..lastIndex
            for (int i = 0; i <= buf.lastIndex; i++) {
                if (!buf.chunksByIndex.containsKey(i)) return;
            }

            // składamy w kolejności
            int total = 0;
            for (int i = 0; i <= buf.lastIndex; i++) total += buf.chunksByIndex.get(i).length;

            int[] all = new int[total];
            int pos = 0;
            for (int i = 0; i <= buf.lastIndex; i++) {
                int[] c = buf.chunksByIndex.get(i);
                System.arraycopy(c, 0, all, pos, c.length);
                pos += c.length;
            }

            maybeAllPoints = all;
        }

        // sprzątamy bufor (poza synchronized)
        byPath.remove(dto.pathId());
        if (byPath.isEmpty()) tempFogChunks.remove(dto.boardId());

        // zapis do snapshotu tylko raz (na końcu)
        BoardState st = getOrCreateState(dto.boardId());
        Snapshot snap = readSnapshot(st);

        // jeśli już istnieje (np. duplikat), to ignorujemy
        if (snap.findObjectById(dto.pathId()) != null) return;

        var fogStroke = FogEraseObject.builder()
                .pathId(dto.pathId())
                .radius(dto.radius())
                .points(maybeAllPoints)
                .build();

        fogStroke.setType("fog");
        fogStroke.setObjectId(dto.pathId());
        fogStroke.setCreatedAt(LocalDateTime.now());
        fogStroke.setOwnerId(owner.getId());

        snap.addFogStroke(dto.layerId(), fogStroke);
        writeSnapshot(st, snap);
        states.save(st);

        // index tylko raz (na końcu)
        var idx = new BoardObjectIndex();
        idx.setObjectId(UUID.fromString(dto.pathId()));
        idx.setBoard(st.getBoard());
        idx.setOwner(owner);
        idx.setType("fog");
        idx.setLayerId(dto.layerId());
        idx.setCreatedAt(LocalDateTime.now());
        indexRepo.save(idx);
    }


}
