import axios from "axios";
import { useState } from "react";
import "./CreateCampaignPage.css";
import defaultPfp from "../../assets/images/nig.jpg";
import { useNavigate } from "react-router";
import { BackgroundFog } from "../../styles/stypecomponents/BackgroundFog";
import { API_URL } from "../../config";

export function CreateCampaignPage() {
  const navigate = useNavigate();
  const [newCampaignName, setNewCampaignName] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [campaignImage, setCampaignImage] = useState<string | undefined>(
    defaultPfp
  );

  const handleCreateCampaign = async () => {
    if (!newCampaignName) {
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/campaign/create`,
        { campaignName: newCampaignName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      const id = response.data;
      if (selectedImageFile && id) {
        const formData = new FormData();
        formData.append("file", selectedImageFile);
        await axios.post(
          `${API_URL}/api/campaign/uploadCampaignImage/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(formData);
        setSelectedImageFile(null);
      }

      setNewCampaignName("");
      navigate("/campaigns");
    } catch (error) {
      console.error("An error occured while creating your campaign", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setCampaignImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="page-wrapper">
      <div className="create-campaign-page">
        <div className="campaign-picture-container">
          <div className="character-card-page-image-wrapper">
            <img className="character-image" src={campaignImage} />
          </div>
          <div className="custom-file-upload">
            <label htmlFor="fileInput" className="file-label">
              Change Picture
            </label>
            <input
              id="fileInput"
              type="file"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="input-buttons">
          <input
            className="input-primary campaign-name-input"
            type="text"
            placeholder={"Enter the campaign name"}
            value={newCampaignName}
            onChange={(e) => {
              setNewCampaignName(e.target.value);
            }}
          />
          <div className="buttons">
            <button
              className="btn-primary create-btn"
              onClick={handleCreateCampaign}
            >
              Create
            </button>
            <button
              onClick={() => {
                navigate("/campaigns");
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <BackgroundFog />
    </div>
  );
}
