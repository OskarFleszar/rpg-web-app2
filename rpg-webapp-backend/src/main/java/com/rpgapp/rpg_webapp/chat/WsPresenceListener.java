package com.rpgapp.rpg_webapp.chat;

import com.rpgapp.rpg_webapp.chat.dto.ChatEntryDTO;
import com.rpgapp.rpg_webapp.user.UserRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Component
public class WsPresenceListener {

    private final SimpMessagingTemplate broker;
    private final UserRepository users;

    // sessionId -> (subscriptionId -> destination)
    private final Map<String, Map<String, String>> subsBySession = new ConcurrentHashMap<>();
    // sessionId -> (destination -> count)
    private final Map<String, Map<String, Integer>> countsBySession = new ConcurrentHashMap<>();

    private static final Pattern CHATROOM = Pattern.compile("^/chatroom/(\\d+)$");

    public WsPresenceListener(SimpMessagingTemplate broker, UserRepository users) {
        this.broker = broker;
        this.users = users;
    }

    @EventListener
    public void onSubscribe(SessionSubscribeEvent event) {
        var acc = StompHeaderAccessor.wrap(event.getMessage());
        String dest = acc.getDestination();
        String sessionId = acc.getSessionId();
        String subId = acc.getSubscriptionId();
        if (dest == null || sessionId == null || subId == null) return;

        var m = CHATROOM.matcher(dest);
        if (!m.find()) return;
        Long campaignId = Long.valueOf(m.group(1));

        subsBySession.computeIfAbsent(sessionId, k -> new ConcurrentHashMap<>()).put(subId, dest);
        int cnt = countsBySession
                .computeIfAbsent(sessionId, k -> new ConcurrentHashMap<>())
                .merge(dest, 1, Integer::sum);

        if (cnt == 1) {
            var dto = systemDto(acc.getUser(), "joined the room");
            broker.convertAndSend("/chatroom/" + campaignId, dto);
        }
    }

    @EventListener
    public void onUnsubscribe(SessionUnsubscribeEvent event) {
        var acc = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = acc.getSessionId();
        String subId = acc.getSubscriptionId();
        if (sessionId == null || subId == null) return;

        var bySub = subsBySession.get(sessionId);
        if (bySub == null) return;

        String dest = bySub.remove(subId);
        if (dest == null) return; // nie chodziło o chatroom

        var counts = countsBySession.get(sessionId);
        if (counts == null) return;

        Integer current = counts.getOrDefault(dest, 0);
        int next = Math.max(0, current - 1);
        if (next == 0) {
            counts.remove(dest);
            var m = CHATROOM.matcher(dest);
            if (m.find()) {
                Long campaignId = Long.valueOf(m.group(1));
                var dto = systemDto(acc.getUser(), "left the room");
                broker.convertAndSend("/chatroom/" + campaignId, dto);
            }
        } else {
            counts.put(dest, next);
        }

        if (bySub.isEmpty()) subsBySession.remove(sessionId);
        if (counts.isEmpty()) countsBySession.remove(sessionId);
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        var acc = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = acc.getSessionId();
        if (sessionId == null) return;

        var counts = countsBySession.remove(sessionId);
        subsBySession.remove(sessionId);
        if (counts == null) return;

        var dto = systemDto(acc.getUser(), "left the room");
        counts.keySet().forEach(dest -> {
            var m = CHATROOM.matcher(dest);
            if (m.find()) {
                Long campaignId = Long.valueOf(m.group(1));
                broker.convertAndSend("/chatroom/" + campaignId, dto);
            }
        });
    }

    private ChatEntryDTO systemDto(Principal principal, String action) {
        Long userId = null;
        String nick = "unknown";
        if (principal != null) {
            try {
                userId = Long.valueOf(principal.getName());
                nick = users.findById(userId).map(u -> u.getNickname()).orElse("unknown");
            } catch (Exception ignored) {}
        }
        return ChatEntryDTO.system(userId, nick, LocalDateTime.now(), nick + " " + action);
    }
}
