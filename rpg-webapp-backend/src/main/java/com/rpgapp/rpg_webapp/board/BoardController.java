package com.rpgapp.rpg_webapp.board;

import com.rpgapp.rpg_webapp.board.entity.*;
import com.rpgapp.rpg_webapp.board.repositories.BoardRepository;
import com.rpgapp.rpg_webapp.board.repositories.BoardStateRepository;
import com.rpgapp.rpg_webapp.campaign.dto.BoardMetaDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/board")
public class BoardController {

    private final BoardStateRepository states;
    private final BoardRepository boardRepository;

    public BoardController(BoardStateRepository states, BoardRepository boardRepository) {
        this.states = states;
        this.boardRepository = boardRepository;
    }

    @GetMapping("/{boardId}/state")
    public ResponseEntity<String> getState(@PathVariable long boardId) {
        return states.findById(boardId)
                .map(s -> ResponseEntity.ok(s.getStateJson()))
                .orElse(ResponseEntity.ok("{\"version\":0,\"layers\":[]}"));
    }

    @GetMapping("/{boardId}/meta")
    public ResponseEntity<BoardMetaDTO> getBoardMeta(@PathVariable long boardId) {
        return boardRepository.findById(boardId)
            .map(b -> ResponseEntity.ok(new BoardMetaDTO(
                b.getCols(),
                b.getRows(),
                b.getCellSize()
            )))
            .orElse(ResponseEntity.notFound().build());
    }


    



}
