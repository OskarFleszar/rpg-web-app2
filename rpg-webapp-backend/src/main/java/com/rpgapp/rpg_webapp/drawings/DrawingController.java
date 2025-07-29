package com.rpgapp.rpg_webapp.drawings;

import com.rpgapp.rpg_webapp.character.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drawing")
public class DrawingController {

    private final DrawingService drawingService;
    private final SimpMessagingTemplate messagingTemplate;
    private final CharacterService characterService;

    @Autowired
    public DrawingController(DrawingService drawingService, SimpMessagingTemplate messagingTemplate, CharacterService characterService) {
        this.drawingService = drawingService;
        this.messagingTemplate = messagingTemplate;
        this.characterService = characterService;
    }

    @PostMapping("/{campaignId}")
    public Drawing saveDrawing(@RequestBody DrawingRequest request, @PathVariable Long campaignId, SimpMessageHeaderAccessor headerAccessor) {
        return drawingService.saveDrawing(request.getPoints(), request.getColor(), request.getLineWidth(), campaignId, headerAccessor);
    }


    @GetMapping("/{campaignId}")
    public List<Drawing> getDrawings(@PathVariable Long campaignId) {
        return drawingService.getDrawingsByCampaign(campaignId);
    }

    @MessageMapping("/drawing/{campaignId}")
    public void broadcastDrawing(@Payload DrawingRequest request, @DestinationVariable Long campaignId, SimpMessageHeaderAccessor headerAccessor) {
        System.out.println("Received DrawingRequest: " + request);
        Drawing savedDrawing = drawingService.saveDrawing(request.getPoints(), request.getColor(), request.getLineWidth(), campaignId, headerAccessor);

    }

    @DeleteMapping("/clear/{campaignId}")
    public void clearDrawings(@PathVariable Long campaignId) {
        drawingService.clearDrawingsByCampaign(campaignId);
        messagingTemplate.convertAndSend("/topic/" + campaignId, "CLEAR_BOARD");
    }

    @DeleteMapping("/undo/{campaignId}")
    public void undoLastDrawing(@PathVariable Long campaignId) {
        Long userId = characterService.getCurrentUser().getUserId();
        boolean success = drawingService.undoLastDrawing(campaignId, userId);
        if (success) {
            messagingTemplate.convertAndSend("/topic/" + campaignId, "UNDO");

        }
    }

}