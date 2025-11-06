package com.rpgapp.rpg_webapp.calendar;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.rpgapp.rpg_webapp.campaign.Campaign;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name= "session_proposals")
@Setter
@Getter
public class SessionProposal  {
  
  public enum Status {
    PROPOSED, 
    CONFIRMED,
    REJECTED
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private Campaign campaign;

  private OffsetDateTime sessionDateTime;

  private Status status = Status.PROPOSED;

   @OneToMany(mappedBy = "proposal",
               cascade = CascadeType.ALL,
               orphanRemoval = true)
    private List<SessionVote> votes = new ArrayList<>();
}
