import axios from "axios";
import { useEffect, useState } from "react";
import { CampaignCard } from "./CamapignCard";
import "./CampaignsPage.css";

type CampaignBasic = {
  campaignId: number;
  campaignName: string;
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
      setCampaigns(response.data);
    } catch (error) {
      console.error("An error ovccured while fetching campaigns", error);
    }
  };
  return (
    <div className="campaigns-page">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.campaignId} campaign={campaign} />
      ))}
    </div>
  );
}
