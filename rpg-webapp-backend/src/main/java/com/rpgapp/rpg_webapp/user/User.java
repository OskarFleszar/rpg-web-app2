package com.rpgapp.rpg_webapp.user;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.rpgapp.rpg_webapp.campaign.Campaign;
import com.rpgapp.rpg_webapp.character.Character;
import com.rpgapp.rpg_webapp.drawings.Drawing;
import com.rpgapp.rpg_webapp.messages.Message;
import com.rpgapp.rpg_webapp.rolls.Roll;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "app_user")
public class User implements UserDetails {

    @Id
    @SequenceGenerator(
            name = "user_sequence",
            sequenceName = "user_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "user_sequence"
    )
    private long userId;
    private String nickname;
    private String email;
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;

    @JsonManagedReference
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Character> characters;

    @JsonManagedReference("user_rolls")
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Roll> roll;

    @JsonManagedReference("message_user")
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> message;

    @ManyToMany(mappedBy = "players", fetch = FetchType.EAGER)
    private Set<Campaign> campaigns;


    @OneToMany(mappedBy = "gameMaster")
    private Set<Campaign> masterCampaigns;

    @JsonManagedReference("drawing_user")
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Drawing> drawing;

    private byte[] profileImage;

    private String imageType;



    public User(String nickname, String email, String password, Role role, List<Character> characters, List<Roll> roll, List<Message> message, Set<Campaign> campaigns, Set<Campaign> masterCampaigns, byte[] profileImage, String imageType) {
        this.nickname = nickname;
        this.email = email;
        this.password = password;
        this.role = role;
        this.characters = characters;
        this.roll = roll;
        this.message = message;
        this.campaigns = campaigns;
        this.masterCampaigns = masterCampaigns;
        this.profileImage = profileImage;
        this.imageType = imageType;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    
    public Long getId() {
        return userId;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
