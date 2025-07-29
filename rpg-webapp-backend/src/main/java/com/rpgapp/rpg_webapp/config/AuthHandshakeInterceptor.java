package com.rpgapp.rpg_webapp.config;

import com.rpgapp.rpg_webapp.messages.MessageService;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.slf4j.Logger;
@Component
public class AuthHandshakeInterceptor implements ChannelInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        String token = accessor.getFirstNativeHeader("Authorization");

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                String username = jwtService.extractUsername(token);

                if (username != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (jwtService.isTokenValid(token, userDetails)) {
                        accessor.getSessionAttributes().put("user", userDetails);
                        return message;
                    }
                }
            }
            throw new IllegalStateException("Brak tokenu JWT lub nieprawidłowy token");
        }
        return message;
    }

}

