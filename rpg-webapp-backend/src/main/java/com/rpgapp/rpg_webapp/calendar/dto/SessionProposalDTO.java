package com.rpgapp.rpg_webapp.calendar.dto;

import java.util.List;

import com.rpgapp.rpg_webapp.calendar.SessionProposal;

public record SessionProposalDTO(
        Long id,
        Long campaignId,
        String campaignName,
        String status,
        String dateTimeUtc,
        List<SessionVoteDTO> votes
) {
    public static SessionProposalDTO from(SessionProposal p) {
        return new SessionProposalDTO(
                p.getId(),
                p.getCampaign().getCampaignId(),          // <<< to jest ważne
                p.getCampaign().getCampaignName(),
                p.getStatus().name(),
                p.getSessionDateTime().toString(),
                p.getVotes().stream()
                        .map(v -> new SessionVoteDTO(
                                v.getUser().getId(),
                                v.getUser().getNickname(), // jak masz
                                v.getVote().name()
                        ))
                        .toList()
        );
    }
}