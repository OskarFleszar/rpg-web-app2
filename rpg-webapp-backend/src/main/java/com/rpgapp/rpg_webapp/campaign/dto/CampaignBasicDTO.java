package com.rpgapp.rpg_webapp.campaign.dto;

import lombok.Data;

@Data
public class CampaignBasicDTO {

    private long campaignId;
    private String campaignName;
    private byte[] campaignImage;
    private String imageType;
    private String gameMasterNickname;

    public CampaignBasicDTO(long campaignId, String campaignName, byte[] campaignImage, String imageType, String gameMasterNickname) {
        this.campaignId = campaignId;
        this.campaignName = campaignName;
        this.campaignImage = campaignImage;
        this.imageType = imageType;
        this.gameMasterNickname = gameMasterNickname;
    }
}
