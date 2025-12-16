package com.rpgapp.rpg_webapp.character;

import com.rpgapp.rpg_webapp.character.dto.CharacterBasicDTO;
import com.rpgapp.rpg_webapp.character.dto.CharacterDetailsDTO;
import com.rpgapp.rpg_webapp.character.dto.CharacterImageDTO;
import com.rpgapp.rpg_webapp.character.dto.ChatCharacterDTO;
import com.rpgapp.rpg_webapp.user.User;
import com.rpgapp.rpg_webapp.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CharacterService {

    private final CharacterRepository characterRepository;
    private final UserRepository userRepository;

    @Autowired
    public CharacterService(CharacterRepository characterRepository, UserRepository userRepository) {
        this.characterRepository = characterRepository;
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            throw new IllegalStateException("User not authenticated");

        Object principal = auth.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            Long userId = Long.parseLong(userDetails.getUsername()); 
            return userRepository.findById(userId)
                    .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                            "User not found"));
        }
        throw new IllegalStateException("User not authenticated");
    }

    public User getCurrentUserWS(SimpMessageHeaderAccessor headers) {
        Principal p = headers.getUser();
        if (p == null) {
            throw new IllegalStateException("No WS Principal on session");
        }

        String name = p.getName();
        Long userId;
        try {
            userId = Long.parseLong(name);
        } catch (NumberFormatException ex) {
            throw new IllegalStateException("WS Principal name is not a numeric userId: " + name, ex);
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: id=" + userId));
    }

    public List<Character> getCharacters() {
        User user = getCurrentUser();
        return user.getCharacters();
    }

  public List<ChatCharacterDTO> getChatCharactersByIds(List<Long> ids) {
    User user = getCurrentUser();

    return characterRepository
            .findChatCharactersForUser(user.getUserId(), ids)  
            .stream()
            .map(c -> new ChatCharacterDTO(
                    c.getCharacterId(),
                    c.getName(),
                    c.getSkills() != null
                            ? new HashMap<>(c.getSkills().any()) 
                            : new HashMap<>()
            ))
            .toList();
}

    public List<CharacterBasicDTO> getCharactersBasic() {
        User user = getCurrentUser();
        return user.getCharacters()
                .stream()
                .map(character -> new CharacterBasicDTO(
                        character.getCharacterId(),
                        character.getName(),
                        character.getCharacterImage(),
                        character.getImageType()))
                .toList();
    }

    public CharacterImageDTO getCharacterImage(Long characterId) {
        
        return characterRepository.findImageDtoById(characterId);
    }

    public Optional<Character> getOneCharacter(Long characterId) {
        return characterRepository.findById(characterId);
    }

    public void addNewCharacter(Character character) {
        User user = getCurrentUser();
        character.setUser(user);
        characterRepository.save(character);

        SpellCard spellCard = new SpellCard();
        spellCard.setCharacter(character);
        character.setSpellCard(spellCard);
        characterRepository.save(character);
        getCharacterId(character);
    }

    public Long getCharacterId(Character character) {
        return character.getCharacterId();
    }

    public void deleteCharacter(Long characterId) {
        boolean exists = characterRepository.existsById(characterId);
        if (!exists) {
            throw new IllegalStateException("character with id: " + characterId + " doesn't exist");
        }
        characterRepository.deleteById(characterId);
    }

    @Transactional
    public void saveCharacterImage(MultipartFile file, Long characterId) throws IOException {
        User user = getCurrentUser();

        Character character = characterRepository
                .findByCharacterIdAndUser_UserId(characterId, user.getUserId())
                .orElseThrow(() -> new IllegalStateException("Character not found for this user"));

        character.setImageType(file.getContentType());
        character.setCharacterImage(file.getBytes());
        characterRepository.save(character);
    }

    public void addNewSpell(List<Spell> spells, Long characterId) {
        Character character = characterRepository.getReferenceById(characterId);

        character.getSpellCard().setSpells(spells);
        characterRepository.save(character);
    }

    public List<Spell> getCharacterSpels(Long characterId) {
        Character character = characterRepository.getReferenceById(characterId);

        return character.getSpellCard().getSpells();
    }

    public CharacterDetailsDTO getCharacterDetails(Long characterId) {
        User user = getCurrentUser();

        Character c = characterRepository
                .findByCharacterIdAndUser_UserId(characterId, user.getUserId())
                .orElseThrow(() -> new IllegalStateException("Character not found for this user"));

        return new CharacterDetailsDTO(
                c.getCharacterId(),
                c.getName(),
                c.getRace(),
                c.getCurrentProfession(),
                c.getLastProfession(),
                c.getAge(),
                c.getGender(),
                c.getEyeColor(),
                c.getWeight(),
                c.getHairColor(),
                c.getHeight(),
                c.getStarSign(),
                c.getSiblings(),
                c.getBirthPlace(),
                c.getSpecialSigns(),
                c.getCampaignName(),
                c.getCampaignYear(),
                c.getDmName(),
                c.getTotalExp(),
                c.getCurrentExp(),
                c.getGold(),
                c.getSilver(),
                c.getBronze(),
                c.getAttributes(),
                c.getSkills(),
                c.getWeapons(),
                c.getArmor(),
                c.getTalents(),
                c.getEquipment(),
                c.getBackstory(),
                c.getNotes());
    }

    @Transactional
    public void updateCharacter(Long characterId, Character updatedCharacter) {
        Character existingCharacter = characterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalStateException("Character with id: " + characterId + " doesn't exist"));

        if (updatedCharacter.getName() != null) {
            existingCharacter.setName(updatedCharacter.getName());
        }
        if (updatedCharacter.getRace() != null) {
            existingCharacter.setRace(updatedCharacter.getRace());
        }
        if (updatedCharacter.getCurrentProfession() != null) {
            existingCharacter.setCurrentProfession(updatedCharacter.getCurrentProfession());
        }
        if (updatedCharacter.getLastProfession() != null) {
            existingCharacter.setLastProfession(updatedCharacter.getLastProfession());
        }
        if (updatedCharacter.getAge() != null) {
            existingCharacter.setAge(updatedCharacter.getAge());
        }
        if (updatedCharacter.getGender() != null) {
            existingCharacter.setGender(updatedCharacter.getGender());
        }
        if (updatedCharacter.getEyeColor() != null) {
            existingCharacter.setEyeColor(updatedCharacter.getEyeColor());
        }
        if (updatedCharacter.getWeight() != null) {
            existingCharacter.setWeight(updatedCharacter.getWeight());
        }
        if (updatedCharacter.getHairColor() != null) {
            existingCharacter.setHairColor(updatedCharacter.getHairColor());
        }
        if (updatedCharacter.getHeight() != null) {
            existingCharacter.setHeight(updatedCharacter.getHeight());
        }
        if (updatedCharacter.getStarSign() != null) {
            existingCharacter.setStarSign(updatedCharacter.getStarSign());
        }
        if (updatedCharacter.getSiblings() != null) {
            existingCharacter.setSiblings(updatedCharacter.getSiblings());
        }
        if (updatedCharacter.getBirthPlace() != null) {
            existingCharacter.setBirthPlace(updatedCharacter.getBirthPlace());
        }
        if (updatedCharacter.getSpecialSigns() != null) {
            existingCharacter.setSpecialSigns(updatedCharacter.getSpecialSigns());
        }
        if (updatedCharacter.getCampaignName() != null) {
            existingCharacter.setCampaignName(updatedCharacter.getCampaignName());
        }
        if (updatedCharacter.getCampaignYear() != null) {
            existingCharacter.setCampaignYear(updatedCharacter.getCampaignYear());
        }
        if (updatedCharacter.getDmName() != null) {
            existingCharacter.setDmName(updatedCharacter.getDmName());
        }
        if (updatedCharacter.getTotalExp() != null) {
            existingCharacter.setTotalExp(updatedCharacter.getTotalExp());
        }
        if (updatedCharacter.getCurrentExp() != null) {
            existingCharacter.setCurrentExp(updatedCharacter.getCurrentExp());
        }
        if (updatedCharacter.getGold() != null) {
            existingCharacter.setGold(updatedCharacter.getGold());
        }
        if (updatedCharacter.getSilver() != null) {
            existingCharacter.setSilver(updatedCharacter.getSilver());
        }
        if (updatedCharacter.getBronze() != null) {
            existingCharacter.setBronze(updatedCharacter.getBronze());
        }
        if (updatedCharacter.getAttributes() != null) {
            existingCharacter.setAttributes(updatedCharacter.getAttributes());
        }
        if (updatedCharacter.getSkills() != null) {
            existingCharacter.setSkills(updatedCharacter.getSkills());
        }
        if (updatedCharacter.getWeapons() != null) {
            existingCharacter.setWeapons(updatedCharacter.getWeapons());
        }
        if (updatedCharacter.getArmor() != null) {
            existingCharacter.setArmor(updatedCharacter.getArmor());
        }
        if (updatedCharacter.getTalents() != null) {
            existingCharacter.setTalents(updatedCharacter.getTalents());
        }
        if (updatedCharacter.getEquipment() != null) {
            existingCharacter.setEquipment(updatedCharacter.getEquipment());
        }
        if (updatedCharacter.getBackstory() != null) {
            existingCharacter.setBackstory(updatedCharacter.getBackstory());
        }
        if (updatedCharacter.getNotes() != null) {
            existingCharacter.setNotes(updatedCharacter.getNotes());
        }

        characterRepository.save(existingCharacter);
    }

}
