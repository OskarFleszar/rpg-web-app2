package com.rpgapp.rpg_webapp.campaign;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.rpgapp.rpg_webapp.drawings.Drawing;
import com.rpgapp.rpg_webapp.messages.Message;
import com.rpgapp.rpg_webapp.rolls.Roll;
import com.rpgapp.rpg_webapp.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "campaigns")
@NoArgsConstructor
@Data
@Builder
@AllArgsConstructor
public class Campaign {

    @Id
    @SequenceGenerator(
            name = "campaign_sequence",
            sequenceName = "campaign_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "campaign_sequence"
    )
    private long campaignId;
    private String campaignName;

    @ManyToOne
    @JoinColumn(name = "game_master_id")
    private User gameMaster;

    @ManyToMany
    @JoinTable(
            name = "campaign_user",
            joinColumns = @JoinColumn(name = "campaign_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> players;

    @JsonManagedReference("campaign_rolls")
    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Roll> roll;

    @JsonManagedReference("message_campaign")
    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> message;

    @JsonManagedReference("drawing_campaign")
    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Drawing> drawing;



    public Campaign(String campaignName, User gameMaster, Set<User> players, List<Roll> roll, List<Message> message, List<Drawing> drawing) {
        this.campaignName = campaignName;
        this.gameMaster = gameMaster;
        this.players = players;
        this.roll = roll;
        this.message = message;
        this.drawing = drawing;
    }
}
