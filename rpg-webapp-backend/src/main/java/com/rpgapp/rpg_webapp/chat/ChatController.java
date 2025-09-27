package com.rpgapp.rpg_webapp.chat;

import com.rpgapp.rpg_webapp.chat.dto.ChatEntryDTO;
import com.rpgapp.rpg_webapp.chat.dto.ChatMessagePostDTO;
import com.rpgapp.rpg_webapp.chat.dto.RollPostDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{campaignId}")
    public List<ChatEntryDTO> getChatEntries(@PathVariable long campaignId) {
        return chatService.getChatEntries(campaignId);
    }

}

