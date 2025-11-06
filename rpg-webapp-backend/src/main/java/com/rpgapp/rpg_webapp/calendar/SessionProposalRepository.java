package com.rpgapp.rpg_webapp.calendar;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionProposalRepository extends JpaRepository<SessionProposal, Long> {
    List<SessionProposal> findByCampaign_CampaignIdOrderBySessionDateTimeDesc(Long campaignId);
    Optional<SessionProposal> findTopByCampaign_CampaignIdOrderBySessionDateTimeDesc(Long campaignId);

    List<SessionProposal>
    findByCampaign_Players_IdAndSessionDateTimeAfterOrderBySessionDateTimeAsc(
            Long userId,
            OffsetDateTime from
    );
}
