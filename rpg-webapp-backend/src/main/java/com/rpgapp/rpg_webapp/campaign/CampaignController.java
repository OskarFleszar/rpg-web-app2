package com.rpgapp.rpg_webapp.campaign;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.rpgapp.rpg_webapp.board.entity.Board;
import com.rpgapp.rpg_webapp.campaign.dto.BoardAddRequestDTO;
import com.rpgapp.rpg_webapp.campaign.dto.BoardBasicDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

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
    public Long createNewCampaign (@RequestBody Campaign campaign) {
        campaignService.createCampaign(campaign);
        return campaignService.getCampaignId(campaign);
    }

    @PostMapping("/{campaignId}/sendInvite")
    public void inviteUserToCampaign(@RequestBody Map<String, String> payload, @PathVariable Long campaignId) {
        String nickname = payload.get("nickname");
        campaignService.sendInviteToCampaign(nickname, campaignId);
    }

    @PostMapping("/{campaignId}/accept")
    public void addUserToCampaign(@RequestBody Long userId, @PathVariable Long campaignId) {
        campaignService.addNewUserToCampaign( userId, campaignId);
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

    @PostMapping(
            path = "/uploadCampaignImage/{campaignId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Void> uploadCharacterImage(
            @PathVariable Long campaignId,
            @RequestPart("file") MultipartFile file
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        campaignService.saveCampaignImage(file, campaignId);
        return ResponseEntity.noContent().build();
    }

}
