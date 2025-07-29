package com.rpgapp.rpg_webapp.messages;

import com.rpgapp.rpg_webapp.character.CharacterService;
import com.rpgapp.rpg_webapp.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MessageService {

    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CharacterService characterService;

    @Autowired
    public MessageService(MessageRepository messageRepository, SimpMessagingTemplate messagingTemplate, CharacterService characterService) {
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
        this.characterService = characterService;
    }

    public void sendMessage(Message message) {
        User user = characterService.getCurrentUser();
        message.setUser(user);
        message.setMessageTime(LocalDateTime.now());

        messageRepository.save(message);
    }

    public Message sendMessageWs(Message message, SimpMessageHeaderAccessor headerAccessor) {
        User user = characterService.getCurrentUserWS(headerAccessor);
        message.setUser(user);
        message.setMessageTime(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        messagingTemplate.convertAndSend("/chatroom/" + message.getCampaign().getCampaignId(), savedMessage);

        return savedMessage;
    }

}
