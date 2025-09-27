package com.rpgapp.rpg_webapp.chat;

import com.rpgapp.rpg_webapp.chat.ChatService;
import com.rpgapp.rpg_webapp.chat.dto.ChatMessagePostDTO;
import com.rpgapp.rpg_webapp.chat.dto.RollPostDTO;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.security.Principal;

@Controller
public class ChatWsController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWsController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/message/{campaignId}")
    public void onMessage(@DestinationVariable long campaignId,
                          @Payload ChatMessagePostDTO body,
                          Principal principal) {
        Long userId = Long.valueOf(principal.getName());
        var dto = chatService.handleIncomingMessage(campaignId, userId, body);
        messagingTemplate.convertAndSend("/chatroom/" + campaignId, dto);
    }

    @MessageMapping("/roll/{campaignId}")
    public void onRoll(@DestinationVariable long campaignId,
                       @Payload RollPostDTO body,
                       Principal principal) {
        Long userId = Long.valueOf(principal.getName());
        var dto = chatService.handleIncomingRoll(campaignId, userId, body);
        messagingTemplate.convertAndSend("/chatroom/" + campaignId, dto);
    }
}
