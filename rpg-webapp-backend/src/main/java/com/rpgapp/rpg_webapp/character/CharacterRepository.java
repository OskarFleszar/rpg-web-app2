package com.rpgapp.rpg_webapp.character;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
  Optional<Character> findByCharacterIdAndUser_UserId(Long characterId, Long userId);

  @Query("""
          select new com.rpgapp.rpg_webapp.character.CharacterImageDTO(
              c.characterImage, c.imageType
          )
          from Character c
          where c.characterId = :id
      """)
  CharacterImageDTO findImageDtoById(@Param("id") Long id);

}
