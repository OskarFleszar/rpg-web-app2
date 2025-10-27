package com.rpgapp.rpg_webapp.board;

import com.rpgapp.rpg_webapp.board.entity.*;
import com.rpgapp.rpg_webapp.board.repositories.BoardStateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
public class BoardController {

    private final BoardStateRepository states;

    public BoardController(BoardStateRepository states) {
        this.states = states;
    }

    @GetMapping("/{boardId}/state")
    public ResponseEntity<String> getState(@PathVariable long boardId) {
        return states.findById(boardId)
                .map(s -> ResponseEntity.ok(s.getStateJson()))
                .orElse(ResponseEntity.ok("{\"version\":0,\"layers\":[]}"));
    }



}
