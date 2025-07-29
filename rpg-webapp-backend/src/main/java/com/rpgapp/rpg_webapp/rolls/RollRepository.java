package com.rpgapp.rpg_webapp.rolls;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RollRepository extends JpaRepository <Roll, Long> {

}
