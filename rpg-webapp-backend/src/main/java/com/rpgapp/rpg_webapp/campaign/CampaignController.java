package com.rpgapp.rpg_webapp.campaign;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.rpgapp.rpg_webapp.board.entity.Board;
import com.rpgapp.rpg_webapp.campaign.dto.BoardAddRequestDTO;
import com.rpgapp.rpg_webapp.campaign.dto.BoardBasicDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;




@RestController
@RequestMapping(path = "api/campaign")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping(path="/{campaignId}")
    public Optional<Campaign> getCampaignData (@PathVariable("campaignId") Long campaignId) {
        return campaignService.getCampaignData(campaignId);
    }
    @GetMapping(path="/{campaignId}/GM")
    public Long getGameMasterId (@PathVariable("campaignId") Long campaignId) {
        return campaignService.getGM(campaignId);
    }

    @PostMapping("/create")
    public void createNewCampaign (@RequestBody Campaign campaign) {
        campaignService.createCampaign(campaign);
    }

    @PostMapping("/{campaignId}/add")
    public void addUserToCampaign(@RequestBody Map<String, String> payload, @PathVariable Long campaignId) {
        String nickname = payload.get("nickname");
        campaignService.addNewUserToCampaign(nickname, campaignId);
    }


  
    @PostMapping("/{campaignId}/addBoard")
    @ResponseStatus(HttpStatus.CREATED)
    public void addNewBoard(@PathVariable Long campaignId,
                            @RequestBody BoardAddRequestDTO req) {
        Campaign campaign = campaignService.getCampaignData(campaignId).orElseThrow();
        campaignService.addNewBoard(campaign, req.name());
    }

    @GetMapping("/{campaignId}/getBoards")
    public List<BoardBasicDTO> getBoards(@PathVariable("campaignId") Long campaignId) {
        return campaignService.getBoards(campaignId);
    }

    @GetMapping("/{campaignId}/activeBoard")
    public Long getActiveBoard(@PathVariable("campaignId") Long campaignId) {
        Campaign campaign = campaignService.getCampaignData(campaignId).orElseThrow();
        return campaign.getActiveBoard().getId();
    }
    
    
    




}
