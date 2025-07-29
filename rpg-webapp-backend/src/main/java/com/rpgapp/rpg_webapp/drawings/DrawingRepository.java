package com.rpgapp.rpg_webapp.drawings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DrawingRepository extends JpaRepository<Drawing, Long> {
    List<Drawing> findByCampaign_CampaignId(Long campaignId);
    @Modifying
    @Query("DELETE FROM Drawing d WHERE d.campaign.id = :campaignId")
    void deleteByCampaignId(@Param("campaignId") Long campaignId);

    @Modifying
    @Query("DELETE FROM Drawing d WHERE d.drawingId = (SELECT MAX(d2.drawingId) FROM Drawing d2 WHERE d2.campaign.campaignId = :campaignId AND d2.user.userId = :userId)")
    void deleteLastUserDrawing(@Param("campaignId") Long campaignId, @Param("userId") Long userId);




}

