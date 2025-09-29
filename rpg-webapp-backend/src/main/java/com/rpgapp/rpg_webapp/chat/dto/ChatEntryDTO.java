package com.rpgapp.rpg_webapp.chat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatEntryDTO(
        String type,
        Long userId,
        String nickname,
        LocalDateTime timestamp,
        String content,
        RollInfo roll
) {
    public static ChatEntryDTO message(Long userId, String nickname, LocalDateTime ts, String content) {
        return new ChatEntryDTO("message", userId, nickname, ts, content, null);
    }

    public static ChatEntryDTO roll(Long userId, String nickname, LocalDateTime ts, String content, RollInfo roll) {
        return new ChatEntryDTO("roll", userId, nickname, ts, content, roll);
    }

    public static ChatEntryDTO system(Long userId, String nick, LocalDateTime ts, String content) {
        return new ChatEntryDTO("system", userId, nick, ts, content, null);
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static record RollInfo(
            String rollType,
            Integer numberOfDice,
            String rollFor,
            Integer bonus,
            List<Integer> results,
            Integer total,
            String outcome
    ) {}
}
