import axios from "axios";
import { useState } from "react";

type ProfileEditingProps = {
  basicUserData: {
    nickname: string;
    email: string;
    password: string;
  };
  image?: string;
  setIsEditing: (isEditing: boolean) => void;
  fetchProfileImage: () => void;
  setImage: (image: string) => void;
};

export function ProfilePageEditing({
  basicUserData,
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
      await axios.post(
        "http://localhost:8080/api/user/uploadProfileImage",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
  return (
    <>
      <div className="profile-page">
        <img className="profile-picture" src={image} />
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
        <button onClick={handleImageUpload}>Upload picture</button>
        <p>Nickname: {basicUserData.nickname}</p>
        <p>Email: {basicUserData.email}</p>
        <button onClick={handleCancelButtonPress}>Cancel</button>
      </div>
    </>
  );
}
