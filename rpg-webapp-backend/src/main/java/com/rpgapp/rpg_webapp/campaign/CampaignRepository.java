package com.rpgapp.rpg_webapp.campaign;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Campaign c JOIN c.players p WHERE c.id = :campaignId AND p.id = :userId")
    boolean existsByUserAndCampaign(@Param("userId") Long userId, @Param("campaignId") Long campaignId);

    @Query("""
  SELECT DISTINCT c
  FROM Campaign c
  LEFT JOIN c.players p
  WHERE p.id = :userId OR c.gameMaster.id = :userId
""")
    List<Campaign> findCampaignsForUser(Long userId);



}

