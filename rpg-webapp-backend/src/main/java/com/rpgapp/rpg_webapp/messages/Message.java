package com.rpgapp.rpg_webapp.messages;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Message {

    @Id
    @SequenceGenerator(
            name = "message_sequence",
            sequenceName = "message_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "message_sequence"
    )
    private long messageId;

    @JsonBackReference("message_user")
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String content;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "MM-dd HH:mm")
    private LocalDateTime messageTime;

    @JsonBackReference("message_campaign")
    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    public String getNickname() {
        return user != null ? user.getNickname() : "Nieznany użytkownik";
    }

    public Message(User user, String content, LocalDateTime messageTime, Campaign campaign) {
        this.user = user;
        this.content = content;
        this.messageTime = messageTime;
        this.campaign = campaign;
    }
}
