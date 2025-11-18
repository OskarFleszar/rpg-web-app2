import axios from "axios";
import { useEffect, useState } from "react";
import { CampaignCard } from "./CamapignCard";
import "./CampaignsPage.css";
import { BackgroundFog } from "../../styles/stypecomponents/BackgroundFog";
import { NavLink } from "react-router";

type CampaignBasic = {
  campaignId: number;
  campaignName: string;
  campaignImage?: string | null;
  imageType?: string | null;
  gameMasterNickname: string;
};

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignBasic[]>([]);

  useEffect(() => {
    fetchBasicCampaignData();
  }, []);

  const fetchBasicCampaignData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/campaigns/basic",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);
      setCampaigns(response.data);
    } catch (error) {
      console.error("An error ovccured while fetching campaigns", error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="campaigns-page">
        <div className="campaign-cards-grid">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.campaignId} campaign={campaign} />
          ))}
        </div>

        <NavLink to={"/campaigns/create"}>
          <button className="btn-primary create-campaign-btn">
            Create Campaign
          </button>
        </NavLink>
      </div>
      <BackgroundFog />
    </div>
  );
}
