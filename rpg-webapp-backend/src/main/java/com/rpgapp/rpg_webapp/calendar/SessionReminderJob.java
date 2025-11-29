package com.rpgapp.rpg_webapp.calendar;

import com.rpgapp.rpg_webapp.notifications.NotificationService;
import com.rpgapp.rpg_webapp.notifications.NotificationType;
import com.rpgapp.rpg_webapp.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map; // <— brakujący import!

@Component
@RequiredArgsConstructor
public class SessionReminderJob {

    private final SessionProposalRepository proposalRepo;
    private final NotificationService notifications;

    // co pełną godzinę
    @Scheduled(cron = "0 0 * * * *")
    public void sendReminders() {
        OffsetDateTime nowUtc = OffsetDateTime.now(ZoneOffset.UTC);

        // zakres ~24h od teraz (23–25h, żeby „złapać” w zaokrągleniach)
        OffsetDateTime from = nowUtc.plusHours(23);
        OffsetDateTime to   = nowUtc.plusHours(25);

        List<SessionProposal> sessions =
                proposalRepo.findByStatusAndSessionDateTimeBetweenOrderBySessionDateTimeAsc(
                        SessionProposal.Status.CONFIRMED, // dopasuj enum
                        from,
                        to
                );

        if (sessions == null || sessions.isEmpty()) return;

        for (SessionProposal s : sessions) {
            // UWAGA: dopasuj nazwy getterów do swojej encji!
            var campaign = s.getCampaign();           // nie getCampaig()
            var players  = campaign.getPlayers();     // Set<User>

            for (User u : players) {
                notifications.notify(
                        u.getId(),                    // Long
                        NotificationType.SESSION_REMINDER,
                        "Session tommorow: " + campaign.getCampaignName(),   // albo getName(), jak masz
                        "Starts at " + s.getSessionDateTime().toLocalTime() + " (UTC)",
                        Map.of(
                                "campaignId", campaign.getCampaignId(),         // nie getId() -> dopasuj do encji
                                "proposalId", s.getId()
                        )
                );
            }
        }
    }
}
