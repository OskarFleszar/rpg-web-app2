package com.rpgapp.rpg_webapp.board.repositories;

import com.rpgapp.rpg_webapp.board.entity.BoardState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardStateRepository  extends JpaRepository<BoardState, Long> {


}
