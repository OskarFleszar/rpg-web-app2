package com.rpgapp.rpg_webapp.user;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.CampaignRepository;
import com.rpgapp.rpg_webapp.character.CharacterService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CharacterService characterService;
    private final CampaignRepository campaignRepository;
    @Autowired

    public UserService(UserRepository userRepository, CharacterService characterService, CampaignRepository campaignRepository) {
        this.userRepository = userRepository;
        this.characterService = characterService;
        this.campaignRepository = campaignRepository;
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public void addNewUser(User user) {
        Optional<User> userOptional = userRepository.findUserByEmail(user.getEmail());
        if (userOptional.isPresent()) {
            throw new IllegalStateException("email taken");
        }
        Optional<User> userOptional2 = userRepository.findUserByNickname(user.getNickname());
        if (userOptional2.isPresent()) {
            throw new IllegalStateException("nickname taken");
        }
        userRepository.save(user);
    }

    @Transactional
    public void saveProfileImage(MultipartFile file) throws IOException {
        User user = characterService.getCurrentUser();

        user.setImageType(file.getContentType());
        user.setProfileImage(file.getBytes());
        userRepository.save(user);
    }


    public void deleteUser(Long userId) {
        boolean exists = userRepository.existsById(userId);
        if (!exists) {
            throw new IllegalStateException("student with id: " + userId + " doesn't exist");
        }
        userRepository.deleteById(userId);

    }

    @Transactional
    public void updateUser(User updatedUser) {
        User user = characterService.getCurrentUser();

        if (updatedUser.getNickname() != null && !updatedUser.getNickname().isEmpty() && !Objects.equals(user.getNickname(), updatedUser.getNickname())) {
            Optional<User> userOptional = userRepository.findUserByNickname(updatedUser.getNickname());
            if(userOptional.isPresent()){
                throw new IllegalStateException("nickname taken");
            }
            user.setNickname(updatedUser.getNickname());
        }

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty() && !Objects.equals(user.getEmail(), updatedUser.getEmail())) {
            Optional<User> userOptional = userRepository.findUserByEmail(updatedUser.getEmail());
            if (userOptional.isPresent()) {
                throw new IllegalStateException("email taken");
            }
            user.setEmail(updatedUser.getEmail());
        }
    }


    public List<Campaign> getUserCampaigns(Long userId) {
        return campaignRepository.findCampaignsForUser(userId);
    }


    public Optional<User> getUserById(long userId){
        return userRepository.findById(userId);
    }

}
