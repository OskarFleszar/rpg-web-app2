package com.rpgapp.rpg_webapp.calendar;

import com.rpgapp.rpg_webapp.user.User;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "session_votes")
@Getter
@Setter
public class SessionVote {

  public enum Vote {
    YES,
    NO
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

   @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id")
    private SessionProposal proposal;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private User user;

  @Enumerated(EnumType.STRING)
  private Vote vote;
}
