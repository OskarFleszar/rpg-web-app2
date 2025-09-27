package com.rpgapp.rpg_webapp.chat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatEntryDTO(
        String type,                 // "message" | "roll"
        Long userId,
        String nickname,
        LocalDateTime timestamp,     // używamy LocalDateTime, żeby pasowało do encji
        String content,              // ładny tekst do wyświetlenia
        RollInfo roll                // null dla "message"
) {
    public static ChatEntryDTO message(Long userId, String nickname, LocalDateTime ts, String content) {
        return new ChatEntryDTO("message", userId, nickname, ts, content, null);
    }

    public static ChatEntryDTO roll(Long userId, String nickname, LocalDateTime ts, String content, RollInfo roll) {
        return new ChatEntryDTO("roll", userId, nickname, ts, content, roll);
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static record RollInfo(
            String rollType,
            Integer numberOfDice,
            String rollFor,
            Integer bonus,
            List<Integer> results,   // jeśli u Ciebie to String, zmień tu na String
            Integer total,
            String outcome           // np. "success"/"failure"/null
    ) {}
}
