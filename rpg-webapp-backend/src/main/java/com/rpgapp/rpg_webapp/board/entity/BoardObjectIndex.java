package com.rpgapp.rpg_webapp.board.entity;

import com.rpgapp.rpg_webapp.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "board_object_index")
@Getter
@Setter @NoArgsConstructor @AllArgsConstructor
public class BoardObjectIndex {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID objectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String layerId;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
