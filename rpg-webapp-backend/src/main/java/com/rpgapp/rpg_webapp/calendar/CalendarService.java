package com.rpgapp.rpg_webapp.calendar;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.rpgapp.rpg_webapp.notifications.NotificationService;
import com.rpgapp.rpg_webapp.notifications.NotificationType;
import lombok.NoArgsConstructor;
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
  private final NotificationService notificationService;


    @Transactional
    public SessionProposal proposeSession(Long campaignId, OffsetDateTime dateTime, Long gmId) {
        Campaign campaign = campaignService.getCampaignData(campaignId).orElseThrow();

        SessionProposal proposal = new SessionProposal();
        proposal.setCampaign(campaign);
        proposal.setSessionDateTime(dateTime);
        proposal.setStatus(SessionProposal.Status.PROPOSED);


        proposal = proposalRepo.save(proposal);


        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String whenUtc = proposal.getSessionDateTime()
                .withOffsetSameInstant(ZoneOffset.UTC)
                .format(fmt) + " (UTC)";


        Set<User> players = campaign.getPlayers();

        for (User member : players) {
            if (member.getId().equals(gmId)) continue;

            notificationService.notify(
                    member.getId(),
                    NotificationType.NEW_SESSION_PROPOSED,
                    "New session date " + campaign.getCampaignName(),
                    whenUtc,
                    Map.of(
                            "campaignId", campaign.getCampaignId(),
                            "proposalId", proposal.getId()
                    )
            );
        }

        return proposal;
    }

    @Transactional
    public SessionProposal vote(Long proposalId, Long userId, SessionVote.Vote vote) {

        SessionProposal proposal = proposalRepo.findById(proposalId).orElseThrow();
        User user = userService.getUserById(userId).orElseThrow();

        SessionVote sessionVote = voteRepo
                .findByProposal_IdAndUser_Id(proposalId, userId)
                .orElseGet(() -> {
                    SessionVote v = new SessionVote();
                    v.setProposal(proposal);
                    v.setUser(user);
                    return v;
                });

        sessionVote.setVote(vote);
        voteRepo.save(sessionVote);

        Set<User> members = proposal.getCampaign().getPlayers();

        var votes = voteRepo.findByProposal_Id(proposalId);

        boolean anyNo = votes.stream()
                .anyMatch(vv -> vv.getVote() == SessionVote.Vote.NO);

        Set<Long> yesVoters = votes.stream()
                .filter(vv -> vv.getVote() == SessionVote.Vote.YES)
                .map(vv -> vv.getUser().getId())
                .collect(Collectors.toSet());


        Set<Long> requiredVoters = members.stream()
                .map(User::getId)
                .collect(Collectors.toSet());


        boolean everyoneVotedYes =
                !requiredVoters.isEmpty() && yesVoters.containsAll(requiredVoters);



        if (anyNo) {
            proposal.setStatus(SessionProposal.Status.REJECTED);
        } else if (everyoneVotedYes) {
            proposal.setStatus(SessionProposal.Status.CONFIRMED);
        } else {
            proposal.setStatus(SessionProposal.Status.PROPOSED);
        }

        return proposalRepo.save(proposal);
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
