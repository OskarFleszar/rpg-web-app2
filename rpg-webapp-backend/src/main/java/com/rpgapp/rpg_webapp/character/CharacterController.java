package com.rpgapp.rpg_webapp.character;

import com.rpgapp.rpg_webapp.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
    public List<Character> getCharacters() {
        return characterService.getCharacters();
    }

    @GetMapping(path = "{characterId}")
    public CharacterDetailsDTO getOneCharacter(@PathVariable Long characterId) {
        return characterService.getCharacterDetails(characterId);
    }

    @GetMapping(path = "/basic")
    public List<CharacterBasicDTO> getCharacterBasic() {
        return characterService.getCharactersBasic();
    }

    @GetMapping(path = "/chosencharacters")
    public List<Character> getCharactersByIds(@RequestParam List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametr 'ids' is required");
        }
        return characterService.getByIds(ids);
    }

    @PostMapping
    public Long makeNewCharacter(@RequestBody Character character) {
        characterService.addNewCharacter(character);
        return characterService.getCharacterId(character);
    }

    @DeleteMapping(path = "{characterId}")
    public void deleteCharacter(@PathVariable("characterId") Long characterId) {
        characterService.deleteCharacter(characterId);
    }

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
    public ResponseEntity<CharacterImageDTO> getCharacterImage(
            @PathVariable Long characterId) {
        CharacterImageDTO dto = characterService.getCharacterImage(characterId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping(path = "/uploadCharacterImage/{characterId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadCharacterImage(
            @PathVariable Long characterId,
            @RequestPart("file") MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        characterService.saveCharacterImage(file, characterId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(path = "/{characterId}/saveSpells")
    public void addNewSpell(@PathVariable Long characterId, @RequestBody List<Spell> spells) {
        characterService.addNewSpell(spells, characterId);
    }

    @GetMapping(path = "/{characterId}/getSpells")
    public List<Spell> getCharacterSpells(@PathVariable Long characterId) {
        return characterService.getCharacterSpels(characterId);
    }
}
