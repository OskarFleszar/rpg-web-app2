package com.rpgapp.rpg_webapp.board.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "board_states")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BoardState {

    @Id
    @Column(name = "board_id")
    private Long boardId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "board_id")
    private Board board;

    @Version
    private Long version;

    @Lob
    @Column(name = "state_json", nullable = false, columnDefinition = "TEXT")
    private String stateJson;
}
