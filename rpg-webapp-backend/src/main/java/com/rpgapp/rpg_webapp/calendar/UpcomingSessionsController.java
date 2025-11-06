package com.rpgapp.rpg_webapp.calendar;

import com.rpgapp.rpg_webapp.calendar.dto.SessionProposalDTO;
import com.rpgapp.rpg_webapp.user.User;
import com.rpgapp.rpg_webapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class UpcomingSessionsController {

    private final CalendarService calendarService;
    private final UserService userService; // lub UserRepository

    @GetMapping("/my-upcoming-sessions/{userId}")
    public List<SessionProposalDTO> list(@PathVariable("userId") Long userId) {
        User user = userService.getUserById(userId).orElseThrow();
        return calendarService
                .getUpcomingSessionsForUser(user.getId())
                .stream()
                .map(SessionProposalDTO::from)
                .toList();
    }
}

