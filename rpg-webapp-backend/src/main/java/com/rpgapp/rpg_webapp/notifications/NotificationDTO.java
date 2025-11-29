package com.rpgapp.rpg_webapp.notifications;

import java.time.Instant;
import java.util.Map;

public record NotificationDTO(
        Long id,
        NotificationType type,
        String title,
        String body,
        Map<String, Object> payload,
        boolean read,
        Instant createdAt
) {}

