package com.rpgapp.rpg_webapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;

@Component
public class AuthHandshakeInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(AuthHandshakeInterceptor.class);

    @Autowired
    private JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            try {
                String auth = accessor.getFirstNativeHeader("Authorization");
                if (auth == null) auth = accessor.getFirstNativeHeader("authorization");
                if (auth == null || !auth.startsWith("Bearer ")) {
                    throw new IllegalStateException("Missing Authorization Bearer");
                }
                String token = auth.substring(7).trim();

                String userId = jwtService.extractUserId(token);
                if (userId == null || userId.isBlank()) {
                    throw new IllegalStateException("Token has no userId (sub/uid)");
                }

                if (!jwtService.isTokenValid(token)) {
                    throw new IllegalStateException("Invalid JWT");
                }

                var principal = new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
                accessor.setUser(principal);

                return message;

            } catch (Exception ex) {
                log.error("WebSocket CONNECT auth failed", ex);
                throw new MessagingException("WS auth failed: " + ex.getMessage(), ex);
            }
        }

        return message;
    }
}
