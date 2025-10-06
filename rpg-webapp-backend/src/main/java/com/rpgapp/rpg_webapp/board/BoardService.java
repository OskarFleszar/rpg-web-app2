package com.rpgapp.rpg_webapp.board;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rpgapp.rpg_webapp.board.dto.StrokeAppendDTO;
import com.rpgapp.rpg_webapp.board.dto.StrokeEndDTO;
import com.rpgapp.rpg_webapp.board.dto.StrokeStartDTO;
import com.rpgapp.rpg_webapp.board.entity.Board;
import com.rpgapp.rpg_webapp.board.entity.BoardObjectIndex;
import com.rpgapp.rpg_webapp.board.entity.BoardState;
import com.rpgapp.rpg_webapp.board.repositories.BoardObjectIndexRepository;
import com.rpgapp.rpg_webapp.board.repositories.BoardRepository;
import com.rpgapp.rpg_webapp.board.repositories.BoardStateRepository;
import com.rpgapp.rpg_webapp.board.snapshot.Snapshot;
import com.rpgapp.rpg_webapp.board.snapshot.StrokeObject;
import com.rpgapp.rpg_webapp.user.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BoardService {

    private final BoardRepository boards;
    private final BoardStateRepository states;
    private final BoardObjectIndexRepository indexRepo;
    private final ObjectMapper mapper;

    private final Map<Long, Map<String, List<int[]>>> tempPaths = new ConcurrentHashMap<>();

    public BoardService(BoardRepository boards, BoardStateRepository states, BoardObjectIndexRepository indexRepo, ObjectMapper mapper) {
        this.boards = boards;
        this.states = states;
        this.indexRepo = indexRepo;
        this.mapper = mapper;
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
            st.setBoard(board);                               // @MapsId zaciągnie PK z Board
            st.setStateJson("{\"version\":0,\"layers\":[]}"); // startowy JSON

            return states.save(st); // ← od razu PERSIST i zwracamy „managed” encję
        });
    }




    @Transactional
    public void handleStrokeStart(StrokeStartDTO dto, User owner) throws Exception {
        tempPaths.computeIfAbsent(dto.boardId(), k -> new ConcurrentHashMap<>()).put(dto.pathId(), new ArrayList<>());

        BoardState st = getOrCreateState(dto.boardId());
        Snapshot snap = readSnapshot(st);

        var stroke = new StrokeObject("stroke", dto.pathId(), dto.pathId(),  dto.color(), dto.width(), new ArrayList<>(), owner.getId(), LocalDateTime.now());

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
}
