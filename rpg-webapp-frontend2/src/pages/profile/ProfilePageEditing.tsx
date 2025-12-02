import axios from "axios";
import { useState } from "react";
import "../../styles/utilities.css";
import { BackgroundFog } from "../../styles/stypecomponents/BackgroundFog";
import { API_URL } from "../../config";

type BasicUserData = { nickname: string; email: string; password: string };

type SetBasicUserData = React.Dispatch<React.SetStateAction<BasicUserData>>;

type ProfileEditingProps = {
  basicUserData: BasicUserData;
  setBasicUserData: SetBasicUserData;
  image?: string;
  setIsEditing: (isEditing: boolean) => void;
  fetchProfileImage: () => void;
  setImage: (image: string) => void;
};

export function ProfilePageEditing({
  basicUserData,
  setBasicUserData,
  image,
  setIsEditing,
  fetchProfileImage,
  setImage,
}: ProfileEditingProps) {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const handleImageUpload = async () => {
    if (!selectedImageFile) return;
    const formData = new FormData();
    formData.append("file", selectedImageFile);

    try {
      await axios.post(`${API_URL}/api/user/uploadProfileImage`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Profile picture uppdated");
      fetchProfileImage();
    } catch (error) {
      console.error("An error occured while uploading the picture ", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleCancelButtonPress = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${API_URL}/api/user`,
        {
          nickname: basicUserData.nickname,
          email: basicUserData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      handleImageUpload();
      setIsEditing(false);
      alert("Dane zostały zaktualizowane");
    } catch (error) {
      console.error("Błąd podczas zapisywania zmian:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="page-wrapper">
      <div className="profile-page">
        <div className="profile-content">
          <div className="profile-picture-wrapper">
            <img className="profile-picture" src={image} alt="avatar" />
          </div>

          <div className="profile-info">
            <div className="custom-file-upload">
              <label htmlFor="fileInput" className="file-label">
                Choose File
              </label>
              <input
                id="fileInput"
                type="file"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>

            <div className="profile-field-edit">
              <label
                htmlFor="nicknameInput"
                className="profile-label profile-label-small"
              >
                Nickname
              </label>
              <input
                id="nicknameInput"
                name="nickname"
                value={basicUserData.nickname}
                onChange={handleChange}
                className="input-primary"
              />
            </div>

            <div className="profile-field-edit">
              <label
                htmlFor="emailInput"
                className="profile-label profile-label-small"
              >
                Email
              </label>
              <input
                id="emailInput"
                name="email"
                value={basicUserData.email}
                onChange={handleChange}
                className="input-primary"
              />
            </div>
          </div>
        </div>

        <div className="profile-actions edit-actions">
          <button
            className="btn btn-secondary"
            onClick={handleCancelButtonPress}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>

      <BackgroundFog />
    </div>
  );
}
