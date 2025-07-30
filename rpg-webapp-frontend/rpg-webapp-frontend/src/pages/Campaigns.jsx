import React, { useEffect, useState } from "react";
import "../styles/Characters.sass";
import { Link } from "react-router-dom";
import axios from "axios";
import CampaignCard from "../components/CampaignCard";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignInput, setShowCampaignInput] = useState(false);
  const [campaignName, setcampaignName] = useState("");

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/campaigns",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCampaigns(response.data);
      console.log("kampanie: ", response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    if (!campaignName) return;

    try {
      const response = await axios.post(
        "http://localhost:8080/api/campaign/create",
        { campaignName: campaignName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setcampaignName("");
      setShowCampaignInput(false);

      fetchCampaigns();
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  return (
    <div className="characters-list">
      <h2>Your Campaigns</h2>
      <div className="characters-container">
        {campaigns.map((campaign, index) => (
          <CampaignCard
            key={campaign.campaignId || index}
            campaignId={campaign.campaignId}
            campaignName={campaign.campaignName}
          />
        ))}
      </div>

      {showCampaignInput ? (
        <div className="new-campaign-form">
          <input
            type="text"
            placeholder="Enter campaign name"
            value={campaignName}
            onChange={(e) => setcampaignName(e.target.value)}
          />
          <button onClick={handleCreateCampaign}>Save Campaign</button>
          <button onClick={() => setShowCampaignInput(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setShowCampaignInput(true)}>
          Create a new campaign
        </button>
      )}
    </div>
  );
};

export default Campaigns;
