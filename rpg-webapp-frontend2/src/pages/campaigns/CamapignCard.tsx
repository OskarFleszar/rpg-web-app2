import { Link } from "react-router";
import "./CampaignCard.css";
import { toImgSrc } from "../characters/CharacterCard";
import defaultPfp from "../../assets/images/braver-blank-pfp.jpg";

type CampaignCardProps = {
  campaign: {
    campaignId: number;
    campaignName: string;
    campaignImage?: string | null;
    imageType?: string | null;
    gameMasterNickname: string;
  };
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const imgSrc = toImgSrc(
    campaign.campaignImage,
    campaign.imageType || undefined
  );
  return (
    <Link
      to={`/campaigns/${campaign.campaignId}/characterselect`}
      className="campaign-link"
    >
      <div className="campaign-card">
        <div className="character-image-wrapper">
          <img
            className="character-image"
            src={imgSrc}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = defaultPfp;
            }}
          />
        </div>
        <p className="campaign-name-text">{campaign.campaignName}</p>
        <p className="gm-nickname">
          Game Master: {campaign.gameMasterNickname}
        </p>
      </div>
    </Link>
  );
}
