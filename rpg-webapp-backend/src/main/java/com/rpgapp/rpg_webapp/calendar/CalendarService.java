package com.rpgapp.rpg_webapp.calendar;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.CampaignService;
import com.rpgapp.rpg_webapp.user.User;
import com.rpgapp.rpg_webapp.user.UserService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalendarService {
  
  private final SessionProposalRepository proposalRepo;
  private final SessionVoteRepository voteRepo;
  private final CampaignService campaignService;
  private final UserService userService;


  @Transactional
  public SessionProposal proposeSession (Long campaignId, OffsetDateTime dateTime, Long gmId){
    Campaign campaign = campaignService.getCampaignData(campaignId).orElseThrow();

    SessionProposal proposal = new SessionProposal();
    proposal.setCampaign(campaign);
    proposal.setSessionDateTime(dateTime); 
    proposal.setStatus(SessionProposal.Status.PROPOSED);

    return proposalRepo.save(proposal);
  }

  public SessionProposal vote(Long proposalId, Long userId, SessionVote.Vote vote){

    SessionProposal proposal = proposalRepo.findById(proposalId).orElseThrow();
    User user = userService.getUserById(userId).orElseThrow();

    SessionVote sessionVote = voteRepo.findByProposal_IdAndUser_Id(proposalId, userId).orElseGet(() -> {
      SessionVote v = new SessionVote();
      v.setProposal(proposal);
      v.setUser(user);
      return v;
    });

    sessionVote.setVote(vote);
    voteRepo.save(sessionVote);

    var members = campaignService.getMembers(proposal.getCampaign().getCampaignId());
    var votes = voteRepo.findByProposal_Id(proposalId);

    boolean everyoneVotedYes = members.stream().allMatch(m ->
                votes.stream().anyMatch(v -> v.getUser().getId().equals(m.getId())
                        && v.getVote() == SessionVote.Vote.YES)
        );

        if (everyoneVotedYes) {
            proposal.setStatus(SessionProposal.Status.CONFIRMED);

        } else if (votes.stream().anyMatch(v -> v.getVote() == SessionVote.Vote.NO)) {
            proposal.setStatus(SessionProposal.Status.REJECTED); 
        }

        return proposal;
  }

   public List<SessionProposal> getProposals(Long campaignId) {
        return proposalRepo
                .findByCampaign_CampaignIdOrderBySessionDateTimeDesc(campaignId);
  }

    public List<SessionProposal> getUpcomingSessionsForUser(Long userId) {
        OffsetDateTime now = OffsetDateTime.now();
        return proposalRepo
                .findByCampaign_Players_IdAndSessionDateTimeAfterOrderBySessionDateTimeAsc(
                        userId,
                        now
                );
    }


}
