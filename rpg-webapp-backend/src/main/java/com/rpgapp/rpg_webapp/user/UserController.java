package com.rpgapp.rpg_webapp.user;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.dto.CampaignBasicDTO;
import com.rpgapp.rpg_webapp.character.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping(path = "api/user")
public class UserController {

    private final UserService userService;
    private final CharacterService characterService;

    @Autowired
    public UserController(UserService userService, CharacterService characterService) {
        this.userService = userService;
        this.characterService = characterService;
    }

    @GetMapping
    public List<User> getUsers(){
        return userService.getUsers();
    }

    @GetMapping(path="/one")
    public User getOneUser() { return characterService.getCurrentUser();}

    @GetMapping(path="/one/id")
    public long getCurrentUserId() {
        return characterService.getCurrentUser().getUserId();
    }

    @GetMapping(path="/one/basic/{userId}")
    public Optional<UserBasicDTO> getUserBasic(@PathVariable long userId) {
        return userService.getUserById(userId).map(user -> new UserBasicDTO(
                user.getNickname(),
                user.getEmail(),
                user.getPassword()
        ));
    }

    @GetMapping(path="/campaigns")
    public Set<Campaign> getUserCampaigns(){
        User user = characterService.getCurrentUser();

        return userService.getUserCampaigns(user.getUserId());
    }

    @GetMapping(path="/campaigns/basic")
    public Set<CampaignBasicDTO> getUserCampaignsBasic(){
        User user = characterService.getCurrentUser();

        return userService.getUserCampaigns(user.getUserId()).stream().map(campaigns -> new CampaignBasicDTO(
                campaigns.getCampaignId(),
                campaigns.getCampaignName()
        )).collect(java.util.stream.Collectors.toSet());
    }


    @GetMapping("/profileImage")
    public ResponseEntity<byte[]> getProfileImage() {
        User user = characterService.getCurrentUser();
        byte[] image = user.getProfileImage();
        return ResponseEntity.ok().contentType(MediaType.valueOf(user.getImageType())).body(image);
    }

    @PostMapping("/uploadProfileImage")
    public ResponseEntity<Void> uploadProfileImage(@RequestParam("file") MultipartFile file) throws IOException {
        userService.saveProfileImage(file);
        return ResponseEntity.ok().build();
    }


    @PostMapping
    public void registerNewUser(@RequestBody User user){
        userService.addNewUser(user);
    }


    @DeleteMapping(path = "{userId}")
    public void deleteUse(@PathVariable("userId") Long userId) {
        userService.deleteUser(userId);
    }

    @PutMapping
    public void updateUser(
            @RequestBody User user){
        userService.updateUser(user);
    }

}
