package com.rpgapp.rpg_webapp.board;

import com.rpgapp.rpg_webapp.board.entity.*;
import com.rpgapp.rpg_webapp.board.repositories.BoardRepository;
import com.rpgapp.rpg_webapp.board.repositories.BoardStateRepository;
import com.rpgapp.rpg_webapp.campaign.dto.BoardMetaDTO;

import com.rpgapp.rpg_webapp.character.dto.CharacterImageDTO;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("/api/board")
public class BoardController {

    private final BoardStateRepository states;
    private final BoardRepository boardRepository;

    private final BoardService boardService;

    public BoardController(BoardStateRepository states, BoardRepository boardRepository, BoardService boardService) {
        this.states = states;
        this.boardRepository = boardRepository;
        this.boardService = boardService;
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

    @GetMapping("/{boardId}/backgroundImage")
    public ResponseEntity<CharacterImageDTO> getBoardBackground(@PathVariable long boardId) {
        return boardRepository.findById(boardId)
                .map(b -> ResponseEntity.ok(new CharacterImageDTO(
                        b.getBackgroundImage(),
                        b.getImageType()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(path = "/{boardId}/backgroundImage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadBoardBackground(
            @PathVariable long boardId,
            @RequestPart("file") MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        boardService.saveBoardBackground(file, boardId);
        return ResponseEntity.noContent().build();
    }


    



}
