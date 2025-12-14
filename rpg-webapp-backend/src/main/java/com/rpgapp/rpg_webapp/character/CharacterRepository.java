package com.rpgapp.rpg_webapp.character;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rpgapp.rpg_webapp.character.dto.CharacterImageDTO;
import com.rpgapp.rpg_webapp.character.dto.ChatCharacterDTO;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
  Optional<Character> findByCharacterIdAndUser_UserId(Long characterId, Long userId);

  @Query("""
          select new com.rpgapp.rpg_webapp.character.dto.CharacterImageDTO(
              c.characterImage, c.imageType
          )
          from Character c
          where c.characterId = :id
      """)
  CharacterImageDTO findImageDtoById(@Param("id") Long id);

  @Query("""
    select c
    from Character c
    where c.user.userId = :userId
      and c.characterId in :ids
""")
List<Character> findChatCharactersForUser(
        @Param("userId") Long userId,
        @Param("ids") List<Long> ids
);



}
