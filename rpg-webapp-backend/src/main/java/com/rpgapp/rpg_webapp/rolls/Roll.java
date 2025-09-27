package com.rpgapp.rpg_webapp.rolls;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "dice_rolls")
public class Roll {


    @Id
    @SequenceGenerator(
            name = "roll_sequence",
            sequenceName = "roll_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "roll_sequence"
    )
    private long rollId;
    private int rollResult;
    private List<Integer> singleDiceResult;
    private int numberOfDice;
    private String rollType;
    private String rollFor;
    private String outcome;
    private LocalDateTime rollTime;
    private Long characterId;
    private int bonus;


    @JsonBackReference("user_rolls")
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @JsonBackReference("campaign_rolls")
    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    public String getNickname() {
        return user != null ? user.getNickname() : "Nieznany użytkownik";
    }

    public Roll(int rollResult, List<Integer> singleDiceResult, int numberOfDice, String rollType, String rollFor, String outcome, LocalDateTime rollTime, Long characterId, int bonus, User user, Campaign campaign) {

        this.rollResult = rollResult;
        this.singleDiceResult = singleDiceResult;
        this.numberOfDice = numberOfDice;
        this.rollType = rollType;
        this.rollFor = rollFor;
        this.outcome = outcome;
        this.rollTime = rollTime;
        this.characterId = characterId;
        this.bonus = bonus;
        this.user = user;
        this.campaign = campaign;
    }
}
