package com.rpgapp.rpg_webapp.campaign;

import com.rpgapp.rpg_webapp.board.entity.Board;
import com.rpgapp.rpg_webapp.board.repositories.BoardRepository;
import com.rpgapp.rpg_webapp.character.CharacterService;
import com.rpgapp.rpg_webapp.user.User;
import com.rpgapp.rpg_webapp.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CharacterService characterService;
    private final UserRepository userRepository;

    private final BoardRepository boardRepository;
    @Autowired
    public CampaignService(CampaignRepository campaignRepository, CharacterService characterService, UserRepository userRepository, BoardRepository boardRepository) {
        this.campaignRepository = campaignRepository;
        this.characterService = characterService;
        this.userRepository = userRepository;
        this.boardRepository = boardRepository;
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
        b = boardRepository.save(b);

        campaign.setActiveBoard(b);
    }


    public void addNewUserToCampaign(String nickname, long campaignId) {

        Optional<User> user = userRepository.findUserByNickname(nickname);
        if (!user.isPresent()) {
            throw new IllegalStateException("User with nickname '" + nickname + "' not found");
        }
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalStateException("Campaign not found"));

        if(campaign.getGameMaster().equals(characterService.getCurrentUser())){
            if (!campaign.getPlayers().contains(user.get())) {
                campaign.getPlayers().add(user.get());
                campaignRepository.save(campaign);
            } else {
                throw new IllegalStateException("User is already part of this campaign");
            }
        }
        else{
            throw new IllegalStateException("You dont have permision to do that");
        }
    }


    public Optional<Campaign> getCampaignData(Long campaignId) {
        return campaignRepository.findById(campaignId);
    }
}
