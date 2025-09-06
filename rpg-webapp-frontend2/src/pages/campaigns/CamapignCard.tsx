import { Link } from "react-router";
import "./CampaignCard.css";

type CampaignCardProps = {
  campaign: {
    campaignId: number;
    campaignName: string;
  };
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      to={`/campaigns/${campaign.campaignId}/characterselect`}
      className="campaign-link"
    >
      <div className="campaign-card">
        <p>{campaign.campaignName}</p>
      </div>
    </Link>
  );
}
