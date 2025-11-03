package com.rpgapp.rpg_webapp.board.repositories;

import com.rpgapp.rpg_webapp.board.entity.Board;
import com.rpgapp.rpg_webapp.campaign.dto.BoardBasicDTO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findAllByCampaign_CampaignId(Long campaignId);
    Optional<Board> findFirstByCampaign_CampaignIdOrderByIdAsc(Long campaignId);
    
     @Query("""
      select new com.rpgapp.rpg_webapp.campaign.dto.BoardBasicDTO(b.id, b.name)
      from Board b
      where b.campaign.id = :campaignId
      order by b.name asc
      """)
    List<BoardBasicDTO> findBoards(@Param("campaignId") Long campaignId);


}

