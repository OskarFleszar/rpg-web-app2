package com.rpgapp.rpg_webapp.rolls;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.CampaignRepository;
import com.rpgapp.rpg_webapp.campaign.CampaignService;
import com.rpgapp.rpg_webapp.character.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping(path = "api/roll")
public class RollController {

    private final RollService rollService;
    private final CampaignRepository campaignRepository;

    private final RollRepository rollRepository;

    @Autowired
    public RollController(RollService rollService, CampaignRepository campaignRepository,RollRepository rollRepository) {
        this.rollService = rollService;
        this.campaignRepository = campaignRepository;
        this.rollRepository = rollRepository;
    }

    @PostMapping("/{campaignId}")
    public void addNewRoll(@RequestBody Roll roll, @PathVariable long campaignId) {

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign with Id: " + campaignId + " not found"));

        roll.setCampaign(campaign);
        rollService.rollTheDice(roll, campaignId);
    }

    @MessageMapping("/roll/{campaignId}")
    public void rollDice(@DestinationVariable long campaignId, @Payload Roll roll, SimpMessageHeaderAccessor headerAccessor) {
        rollService.rollTheDiceWs(roll, campaignId, headerAccessor);
    }

    @PutMapping("/{rollId}/outcome")
    public ResponseEntity<?> updateOutcome(@PathVariable Long rollId, @RequestBody Map<String, String> payload) {
        String outcome = payload.get("outcome");

        Roll roll = rollRepository.findById(rollId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Roll not found"));

        roll.setOutcome(outcome);
        rollRepository.save(roll);

        return ResponseEntity.ok("Outcome updated");
    }

}
