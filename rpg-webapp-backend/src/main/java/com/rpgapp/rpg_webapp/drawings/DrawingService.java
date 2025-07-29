package com.rpgapp.rpg_webapp.drawings;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.CampaignRepository;
import com.rpgapp.rpg_webapp.character.CharacterService;
import com.rpgapp.rpg_webapp.user.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DrawingService {
    private final DrawingRepository drawingRepository;
    private final CampaignRepository campaignRepository;
    private final CharacterService characterService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public DrawingService(
            DrawingRepository drawingRepository,
            CampaignRepository campaignRepository,
            CharacterService characterService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.drawingRepository = drawingRepository;
        this.campaignRepository = campaignRepository;
        this.characterService = characterService;
        this.messagingTemplate = messagingTemplate;
    }

    public Drawing saveDrawing(List<Point> points, String color, int lineWidth, Long campaignId, SimpMessageHeaderAccessor headerAccessor) {
        User user = characterService.getCurrentUserWS(headerAccessor);
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        Drawing drawing = new Drawing();
        drawing.setPoints(points);
        drawing.setColor(color);
        drawing.setLineWidth(lineWidth);
        drawing.setUser(user);
        drawing.setCampaign(campaign);
        drawing.setCreatedTime(LocalDateTime.now());

        Drawing savedDrawing = drawingRepository.save(drawing);

        messagingTemplate.convertAndSend("/topic/" + campaignId, savedDrawing);

        return savedDrawing;
    }


    public List<Drawing> getDrawingsByCampaign(Long campaignId) {
        return drawingRepository.findByCampaign_CampaignId(campaignId);
    }

    @Transactional
    public void clearDrawingsByCampaign(Long campaignId) {
        drawingRepository.deleteByCampaignId(campaignId);
    }


    @Transactional
    public boolean undoLastDrawing(Long campaignId, Long userId) {
        try {
            drawingRepository.deleteLastUserDrawing(campaignId, userId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}