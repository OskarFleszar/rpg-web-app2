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
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");

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

  const handleCreateCampaign = async () => {
    if (!newCampaignName) {
      return;
    }
    try {
      await axios.post(
        "http://localhost:8080/api/campaign/create",
        { campaignName: newCampaignName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setIsCreatingCampaign(false);
      setNewCampaignName("");
      fetchBasicCampaignData();
    } catch (error) {
      console.error("An error occured while creating your campaign", error);
    }
  };
  return (
    <div className="campaigns-page">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.campaignId} campaign={campaign} />
      ))}

      {isCreatingCampaign ? (
        <div className="new-campaign-form">
          <input
            type="text"
            placeholder={"Enthe the napmaign name"}
            value={newCampaignName}
            onChange={(e) => {
              setNewCampaignName(e.target.value);
            }}
          />
          <button onClick={handleCreateCampaign}>Create</button>
          <button
            onClick={() => {
              setIsCreatingCampaign(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setIsCreatingCampaign(true)}>
          Create Campaign
        </button>
      )}
    </div>
  );
}
