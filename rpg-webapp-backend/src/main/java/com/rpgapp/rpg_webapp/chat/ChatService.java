package com.rpgapp.rpg_webapp.chat;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.campaign.CampaignRepository;
import com.rpgapp.rpg_webapp.messages.Message;
import com.rpgapp.rpg_webapp.rolls.Roll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
@Service
public class ChatService {

    private final CampaignRepository campaignRepository;

    @Autowired
    public ChatService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }



    public List<ChatEntry> getChatEntries(long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        List<Message> messages = campaign.getMessage();
        List<Roll> rolls = campaign.getRoll();

        List<ChatEntry> chatEntries = new ArrayList<>();

        for (Message message : messages) {
            chatEntries.add(new ChatEntry(
                    message.getUser().getNickname(),
                    message.getContent(),
                    message.getMessageTime(),
                    "message",
                    null // outcome nie dotyczy wiadomości
            ));
        }


        for (Roll roll : rolls) {
            String rollContent = "Rolled for: " + roll.getRollFor() +
                    " using " + roll.getNumberOfDice() + " x " +
                    roll.getRollType() + " Result: " + roll.getSingleDiceResult() +
                    " = " + roll.getRollResult();

            chatEntries.add(new ChatEntry(
                    roll.getUser().getNickname(),
                    rollContent,
                    roll.getRollTime(),
                    "roll",
                    roll.getOutcome() // Pobieranie outcome z tabeli Roll
            ));
        }


        chatEntries.sort(Comparator.comparing(ChatEntry::getTimestamp));

        return chatEntries;
    }

}
