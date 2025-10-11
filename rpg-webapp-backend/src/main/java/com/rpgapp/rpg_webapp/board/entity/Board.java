package com.rpgapp.rpg_webapp.board.entity;

import com.rpgapp.rpg_webapp.campaign.Campaign;
import jakarta.persistence.*;
import lombok.*;

@Table(name = "boards")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    private String name;

    @OneToOne(mappedBy = "board",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private BoardState state;
}
