package com.rpgapp.rpg_webapp.notifications;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Setter
@Getter
public class Notification {
    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;
    @Column(length = 2000)
    private String body;

    @Column(length = 2000)
    private String payloadJson;

    private boolean readFlag = false;
    private Instant createdAt = Instant.now();
}
