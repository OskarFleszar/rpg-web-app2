package com.rpgapp.rpg_webapp.calendar;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionVoteRepository extends JpaRepository<SessionVote, Long> {
    List<SessionVote> findByProposal_Id(Long proposalId);
    Optional<SessionVote> findByProposal_IdAndUser_Id(Long proposalId, Long userId);
}
