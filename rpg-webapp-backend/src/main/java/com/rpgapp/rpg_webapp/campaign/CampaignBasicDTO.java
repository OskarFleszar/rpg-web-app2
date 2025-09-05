package com.rpgapp.rpg_webapp.campaign;

import lombok.Data;

@Data
public class CampaignBasicDTO {

    private long campaignId;
    private String campaignName;

    public CampaignBasicDTO(long campaignId, String campaignName) {
        this.campaignId = campaignId;
        this.campaignName = campaignName;
    }
}
