package com.rpgapp.rpg_webapp.chat;

import com.rpgapp.rpg_webapp.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ChatEntry {

   private String nickname;
   private String content;
   private LocalDateTime timestamp;
   private String type;
   private String outcome;
}
