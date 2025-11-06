package com.rpgapp.rpg_webapp.calendar.dto;

import java.util.List;

import com.rpgapp.rpg_webapp.calendar.SessionProposal;

public record SessionProposalDTO(
        Long id,
        String status,
        String dateTimeUtc,
        List<SessionVoteDTO> votes
) {
    public static SessionProposalDTO from(SessionProposal p) {
        return new SessionProposalDTO(
                p.getId(),
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