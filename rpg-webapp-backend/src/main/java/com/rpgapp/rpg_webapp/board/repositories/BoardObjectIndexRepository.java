package com.rpgapp.rpg_webapp.board.repositories;

import com.rpgapp.rpg_webapp.board.entity.BoardObjectIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface BoardObjectIndexRepository extends JpaRepository<BoardObjectIndex, UUID> {
    boolean existsByObjectIdAndOwner_UserId(UUID objectId, Long userId);
    void deleteByObjectId(UUID objectId);


    @Modifying
    @Query("delete from BoardObjectIndex i where i.board.id = :boardId")
    void deleteByBoardId(@Param("boardId") long boardId);


}
