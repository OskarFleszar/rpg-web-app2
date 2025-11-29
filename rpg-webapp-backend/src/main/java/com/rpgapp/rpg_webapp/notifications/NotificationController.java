package com.rpgapp.rpg_webapp.notifications;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;

    @GetMapping(path = "/{userId}")
    public List<NotificationDTO> my(@PathVariable("userId") Long userId) {
        return service.list(userId);
    }

    @PostMapping("/{userId}/{id}/read")
    public void read(@PathVariable("id") Long id, @PathVariable("userId") Long userId) {
        service.markRead(userId, id);
    }

    @GetMapping("/{userId}/unread-count")
    public long unread(@PathVariable("userId") Long userId) {
        return service.unreadCount(userId);
    }
}

