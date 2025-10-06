package com.rpgapp.rpg_webapp.board.repositories;

import com.rpgapp.rpg_webapp.board.entity.BoardObjectIndex;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BoardObjectIndexRepository extends JpaRepository<BoardObjectIndex, UUID> {
    boolean existsByObjectIdAndOwner_UserId(UUID objectId, Long userId);
    void deleteByObjectId(UUID objectId);

}
