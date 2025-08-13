package com.rpgapp.rpg_webapp.character;

import com.rpgapp.rpg_webapp.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(path = "api/character")
public class CharacterController {

    private final CharacterService characterService;
    private final CharacterRepository characterRepository;

    @Autowired
    public CharacterController(CharacterService characterService, CharacterRepository characterRepository) {
        this.characterService = characterService;
        this.characterRepository = characterRepository;
    }

    @GetMapping
    public List<Character> getCharacters() {return characterService.getCharacters();}

    @GetMapping(path ="{characterId}")
    public Optional<Character> getOneCharacter(@PathVariable("characterId") Long characterId) {
        return characterService.getOneCharacter(characterId);
    }

    @GetMapping(path = "/basic")
    public List<CharacterBasicDTO> getCharacterBasic(){
        return characterService.getCharactersBasic();
    }

    @PostMapping
    public void makeNewCharacter(@RequestBody Character character) {characterService.addNewCharacter(character);}

    @DeleteMapping(path ="{characterId}")
    public void deleteCharacter(@PathVariable("characterId") Long characterId) {characterService.deleteCharacter(characterId);}

    @PutMapping(path = "{characterId}")
    public void updateCharacter(@PathVariable("characterId") Long characterId,
                                @RequestBody Character character) {
        characterService.updateCharacter(characterId, character);
    }

    @GetMapping("/default-skills")
    public Skills getDefaultSkills() {
        return new Skills();
    }

    @GetMapping("/default-attributes")
    public Attribute getDefaultAttributes() {
        return new Attribute();
    }

    @GetMapping("/characterImage/{characterId}")
    public ResponseEntity<byte[]> getCharacterImage(@PathVariable("characterId") Long characterId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new IllegalStateException("Character with id: " + characterId + " doesn't exist"));
        byte[] image = character.getCharacterImage();
        return ResponseEntity.ok().contentType(MediaType.valueOf(character.getImageType())).body(image);
    }

    @PostMapping("/uploadCharacterImage/{characterId}")
    public void uploadCharacterImage(MultipartFile file,@PathVariable("characterId") Long characterId) throws IOException {
        characterService.saveCharacterImage(file,characterId);
    }
}
