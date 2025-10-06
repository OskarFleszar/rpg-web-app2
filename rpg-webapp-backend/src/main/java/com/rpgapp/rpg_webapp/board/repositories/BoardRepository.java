package com.rpgapp.rpg_webapp.board.repositories;

import com.rpgapp.rpg_webapp.board.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findAllByCampaign_CampaignId(Long campaignId);
    Optional<Board> findFirstByCampaign_CampaignIdOrderByIdAsc(Long campaignId);
}

