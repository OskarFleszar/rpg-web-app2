package com.rpgapp.rpg_webapp.campaign;

import com.rpgapp.rpg_webapp.board.entity.Board;
import com.rpgapp.rpg_webapp.board.repositories.BoardRepository;
import com.rpgapp.rpg_webapp.campaign.dto.BoardBasicDTO;
import com.rpgapp.rpg_webapp.character.Character;
import com.rpgapp.rpg_webapp.character.CharacterService;
import com.rpgapp.rpg_webapp.notifications.NotificationService;
import com.rpgapp.rpg_webapp.notifications.NotificationType;
import com.rpgapp.rpg_webapp.user.User;
import com.rpgapp.rpg_webapp.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CharacterService characterService;
    private final UserRepository userRepository;

    private final BoardRepository boardRepository;

    private final NotificationService notificationService;
    @Autowired
    public CampaignService(CampaignRepository campaignRepository, CharacterService characterService, UserRepository userRepository, BoardRepository boardRepository, NotificationService notificationService) {
        this.campaignRepository = campaignRepository;
        this.characterService = characterService;
        this.userRepository = userRepository;
        this.boardRepository = boardRepository;
        this.notificationService = notificationService;
    }


    public void createCampaign(Campaign campaign) {
        User user = characterService.getCurrentUser();
        campaign.setGameMaster(user);

        if (campaign.getPlayers() == null) {
            campaign.setPlayers(new HashSet<>());
        }


        campaignRepository.save(campaign);

        campaign.getPlayers().add(user);
        Board b = new Board();
        b.setCampaign(campaign);
        b.setName("Board 1");
        b.setCols(20);
        b.setRows(20);
        b.setCellSize(80);
        b = boardRepository.save(b);

        campaign.setActiveBoard(b);
        campaignRepository.save(campaign);
    }


    public void sendInviteToCampaign(String nickname, long campaignId) {
        var user = userRepository.findUserByNickname(nickname)
                .orElseThrow(() -> new IllegalStateException("User with nickname '" + nickname + "' not found"));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalStateException("Campaign not found"));


        if (!campaign.getGameMaster().equals(characterService.getCurrentUser())) {
            throw new IllegalStateException("You dont have permission to do that");
        }

        if (campaign.getPlayers().contains(user)) {
            throw new IllegalStateException("User is already part of this campaign");
        }

        String campaignName = campaign.getCampaignName();
        String gmName = campaign.getGameMaster().getNickname();

        notificationService.notify(
                user.getUserId(),
                NotificationType.INVITED_TO_CAMPAIGN,
                "Invitation to campaign: " + campaignName,
                "GM: " + gmName + " invited you to his campaign.",
                Map.of("campaignId", campaign.getCampaignId())
        );
    }

    public void addNewUserToCampaign(Long userId, long campaignId) {
        var user = userRepository.findUserById(userId)
                .orElseThrow(() -> new IllegalStateException("User with id '" + userId + "' not found"));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalStateException("Campaign not found"));

        campaign.getPlayers().add(user);
        campaignRepository.save(campaign);
    }



    public Optional<Campaign> getCampaignData(Long campaignId) {
        return campaignRepository.findById(campaignId);
    }

    public Long getCampaignId (Campaign campaign) {
        return campaign.getCampaignId();
    }

    public Long getGM (Long campaignId) {
      Campaign campaign = campaignRepository.findById(campaignId).orElseThrow(() -> new EntityNotFoundException("Campaign " + campaignId + " not found"));

     return campaign.getGameMaster().getId();

    }

    public void addNewBoard(Campaign campaign, String name, Integer cols, Integer rows) {

        Board b = new Board();
        b.setCampaign(campaign);
        b.setName(name);
        b.setCellSize(80);
        if (cols <= 0) {
           b.setCols(1); 
        } else if (cols > 100) {
            b.setCols(100);
        } else {
            b.setCols(cols);
        }
        if (rows <= 0) {
           b.setRows(1); 
        } else if (rows > 100) {
            b.setRows(100);
        } else {
            b.setRows(rows);
        }
        campaign.getBoards().add(b);
        b = boardRepository.save(b);
    }

    public List<BoardBasicDTO> getBoards (Long canpaignId) {
        return boardRepository.findBoards(canpaignId);
    }

    public void changeActiveBoard (Long campaignId, Long boardId) {
        Campaign campaign = getCampaignData(campaignId).orElseThrow();
        Board board  = boardRepository.findById(boardId)
            .orElseThrow(() -> new EntityNotFoundException("Board not found: " + boardId));
        campaign.setActiveBoard(board);
    }

    public List<User> getMembers(Long camapignId) {
        Campaign campaign = getCampaignData(camapignId).orElseThrow();
        Set<User> members = campaign.getPlayers();

         return List.copyOf(members);
    }

    @Transactional
    public void saveCampaignImage(MultipartFile file, Long campaignId) throws IOException {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalStateException("Campaign with id: " + campaignId + " doesn't exist"));

        campaign.setImageType(file.getContentType());
        campaign.setCampaignImage(file.getBytes());
        campaignRepository.save(campaign);
    }
}
