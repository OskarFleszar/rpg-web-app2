package com.rpgapp.rpg_webapp.user;

import lombok.Data;

@Data
public class UserBasicDTO {

    private String nickname;
    private String email;
    private String password;

    public UserBasicDTO(String nickname, String email, String password) {
        this.nickname = nickname;
        this.email = email;
        this.password = password;
    }
}
