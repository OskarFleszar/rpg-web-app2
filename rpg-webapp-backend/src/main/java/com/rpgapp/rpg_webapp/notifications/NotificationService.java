package com.rpgapp.rpg_webapp.notifications;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messaging;
    private final NotificationRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();


    public Notification notify(
            Long userId,
            NotificationType type,
            String title,
            String body,
            Map<String, Object> payload
    ) {
        var n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);

        if (payload != null) {
            try {
                n.setPayloadJson(mapper.writeValueAsString(payload));
            } catch (Exception e) {

                n.setPayloadJson(null);
            }
        }

        var saved = repo.save(n);


        messaging.convertAndSendToUser(
                String.valueOf(userId),
                "/queue/notifications",
                toDto(saved)
        );

        return saved;
    }

    public List<NotificationDTO> list(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public void markRead(Long userId, Long notificationId) {
        var n = repo.findById(notificationId).orElseThrow();
        if (!n.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not yours");
        }
        n.setReadFlag(true);
        repo.save(n);
    }

    private NotificationDTO toDto(Notification n) {
        Map<String, Object> payload = null;
        try {
            var json = n.getPayloadJson();
            if (json != null && !json.isBlank()) {
                payload = mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {

        }

        return new NotificationDTO(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getBody(),
                payload,
                n.isReadFlag(),
                n.getCreatedAt()
        );
    }

    public long unreadCount(Long userId) {
        return repo.countByUserIdAndReadFlagFalse(userId);
    }

}
