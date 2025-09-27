package com.rpgapp.rpg_webapp.chat;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.CampaignRepository;
import com.rpgapp.rpg_webapp.character.CharacterService;
import com.rpgapp.rpg_webapp.chat.dto.ChatEntryDTO;
import com.rpgapp.rpg_webapp.chat.dto.ChatMessagePostDTO;
import com.rpgapp.rpg_webapp.chat.dto.RollPostDTO;
import com.rpgapp.rpg_webapp.messages.Message;
import com.rpgapp.rpg_webapp.messages.MessageRepository;
import com.rpgapp.rpg_webapp.rolls.Roll;
import com.rpgapp.rpg_webapp.rolls.RollRepository;
import com.rpgapp.rpg_webapp.rolls.RollService;
import com.rpgapp.rpg_webapp.user.User;
import com.rpgapp.rpg_webapp.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final RollRepository rollRepository;

    private final RollService rollService;

    private final CharacterService characterService;

    public ChatService(CampaignRepository campaignRepository, UserRepository userRepository, MessageRepository messageRepository, RollRepository rollRepository, RollService rollService, CharacterService characterService) {
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.rollRepository = rollRepository;
        this.rollService = rollService;
        this.characterService = characterService;
    }

    public List<ChatEntryDTO> getChatEntries(long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        List<ChatEntryDTO> out = new ArrayList<>();

        for (Message m : campaign.getMessage()) {
            out.add(ChatEntryDTO.message(
                    m.getUser().getId(),
                    m.getUser().getNickname(),
                    m.getMessageTime(),
                    m.getContent()
            ));
        }

        for (Roll r : campaign.getRoll()) {
            List<Integer> results = r.getSingleDiceResult();
            String content = "Rolled for: " + r.getRollFor() +
                    " using " + r.getNumberOfDice() + " x " + r.getRollType() +
                    " Result: " + results + " = " + r.getRollResult();

            ChatEntryDTO.RollInfo info = new ChatEntryDTO.RollInfo(
                    r.getRollType(),
                    r.getNumberOfDice(),
                    r.getRollFor(),
                    r.getBonus(),
                    results,
                    r.getRollResult(),
                    r.getOutcome()

            );

            out.add(ChatEntryDTO.roll(
                    r.getUser().getId(),
                    r.getUser().getNickname(),
                    r.getRollTime(),
                    content,
                    info
            ));
        }

        out.sort(Comparator.comparing(ChatEntryDTO::timestamp));
        return out;
    }

    public ChatEntryDTO handleIncomingMessage(long campaignId, Long userId, ChatMessagePostDTO body) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDateTime now = LocalDateTime.now();

        Message msg = new Message();
        msg.setCampaign(campaign);
        msg.setUser(user);
        msg.setContent(body.content());
        msg.setMessageTime(now);
        messageRepository.save(msg);

        return ChatEntryDTO.message(user.getId(), user.getNickname(), now, body.content());
    }


    public ChatEntryDTO handleIncomingRoll(long campaignId, Long userId, RollPostDTO body) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDateTime now = LocalDateTime.now();

        int diceCount = body.numberOfDice() != null ? body.numberOfDice() : 1;
        int sides = parseSides(body.rollType());
        List<Integer> results = rollDice(diceCount, sides);

        int bonus = body.bonus() != null ? body.bonus() : 0;
        int total = sum(results) + bonus;


        Roll roll = new Roll();
        roll.setCampaign(campaign);
        roll.setUser(user);
        roll.setRollType(body.rollType());
        roll.setNumberOfDice(diceCount);
        roll.setRollFor(body.rollFor());
        roll.setBonus(bonus);
        roll.setSingleDiceResult(results);
        roll.setRollResult(total);
        roll.setRollTime(now);


        String outcome = null;
        boolean canEvaluate = body.characterId() != null
                && body.rollFor() != null
                && !"other".equalsIgnoreCase(body.rollFor());

        if (canEvaluate) {
            var character = characterService.getOneCharacter(body.characterId())
                    .orElseThrow(() -> new IllegalArgumentException("Character not found: " + body.characterId()));

            boolean success = rollService.getRollOutcome(character, roll);
            outcome = success ? "success" : "failure";
        }
        roll.setOutcome(outcome);
        rollRepository.save(roll);

        String content = "Rolled for: " + body.rollFor()
                + " using " + diceCount + " x d" + sides
                + " Result: " + results + " = " + total;


        ChatEntryDTO.RollInfo info = new ChatEntryDTO.RollInfo(
                body.rollType(), diceCount, body.rollFor(),
                bonus, results, total, outcome
        );

        return ChatEntryDTO.roll(user.getId(), user.getNickname(), now, content, info);
    }



    private int parseSides(String rollType) {
        if (rollType == null) return 6;
        String s = rollType.trim().toLowerCase();
        if (s.startsWith("d")) {
            try { return Integer.parseInt(s.substring(1)); } catch (NumberFormatException ignored) {}
        }
        return 6;
    }

    private List<Integer> rollDice(int count, int sides) {
        Random r = new Random();
        List<Integer> out = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            out.add(1 + r.nextInt(Math.max(1, sides)));
        }
        return out;
    }

    private int sum(List<Integer> values) {
        int s = 0;
        if (values != null) {
            for (Integer v : values) s += (v != null ? v : 0);
        }
        return s;
    }
}
