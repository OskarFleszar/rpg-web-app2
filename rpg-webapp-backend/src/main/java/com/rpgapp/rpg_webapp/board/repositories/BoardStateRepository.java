package com.rpgapp.rpg_webapp.board.repositories;

import com.rpgapp.rpg_webapp.board.entity.BoardState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardStateRepository  extends JpaRepository<BoardState, Long> {
}
