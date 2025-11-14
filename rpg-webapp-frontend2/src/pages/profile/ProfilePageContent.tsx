import { BackgroundFog } from "../../styles/stypecomponents/BackgroundFog";
import "../../styles/utilities.css";

type ProfileContentProps = {
  basicUserData: {
    nickname: string;
    email: string;
    password: string;
  };
  image?: string;
  setIsEditing: (isEditing: boolean) => void;
};

export function ProfilePageContent({
  basicUserData,
  image,
  setIsEditing,
}: ProfileContentProps) {
  const handleEditButtonPress = () => {
    setIsEditing(true);
  };

  return (
    <div className="page-wrapper">
      <div className="profile-page">
        <div className="profile-content">
          <div className="profile-picture-wrapper">
            <img className="profile-picture" src={image} alt="avatar" />
          </div>

          <div className="profile-info">
            <div className="profile-field">
              <p className="profile-label">Nickname:</p>
              <p className="profile-value">{basicUserData.nickname}</p>
            </div>

            <div className="profile-field">
              <p className="profile-label">E-mail:</p>
              <p className="profile-value">{basicUserData.email}</p>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button className="btn btn-primary" onClick={handleEditButtonPress}>
            Edit
          </button>
        </div>
      </div>

      <BackgroundFog />
    </div>
  );
}
