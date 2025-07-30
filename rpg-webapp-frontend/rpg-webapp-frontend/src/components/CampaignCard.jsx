import { Link } from "react-router-dom";

const CampaignCard = ({ campaignId, campaignName }) => {
  return (
    <Link
      to={`/campaigns/${campaignId}/select-character`}
      className="character-card"
    >
      <h3>{campaignName}</h3>
    </Link>
  );
};

export default CampaignCard;
