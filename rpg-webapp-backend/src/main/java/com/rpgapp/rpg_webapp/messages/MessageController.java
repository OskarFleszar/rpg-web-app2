package com.rpgapp.rpg_webapp.messages;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.CampaignRepository;
import com.rpgapp.rpg_webapp.character.CharacterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/message")
public class MessageController {
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);

    private final MessageService messageService;
    private final CampaignRepository campaignRepository;
    private final CharacterService characterService;

    @Autowired
    public MessageController(MessageService messageService, CampaignRepository campaignRepository, CharacterService characterService) {
        this.messageService = messageService;
        this.campaignRepository = campaignRepository;
        this.characterService = characterService;
    }

    @PostMapping("/{campaignId}")
    public void addNewMessage(@RequestBody Message message, @PathVariable long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign with Id: " + campaignId + " not found"));
        message.setCampaign(campaign);
        messageService.sendMessage(message);
    }

    /*@MessageMapping("/message/{campaignId}")
    public void sendMessage(@Payload Message message, @DestinationVariable long campaignId, SimpMessageHeaderAccessor headerAccessor) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        message.setCampaign(campaign);

        messageService.sendMessageWs(message, headerAccessor);
    }*/
}
