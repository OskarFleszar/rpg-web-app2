import axios from "axios";
import { useEffect, useState } from "react";
import "./ProfilePage.css";
import defaultPfp from "../assets/images/nig.jpg";

export function ProfilePage() {
  const [basicUserData, setBasicUserData] = useState({
    nickname: "",
    email: "",
    password: "",
  });
  const [image, setImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfileImage();
    loadBasicUserData();
  }, []);

  const loadBasicUserData = async () => {
    const response = await axios.get(
      `http://localhost:8080/api/user/one/basic/${localStorage.getItem(
        "userId"
      )}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    setBasicUserData(response.data);
  };

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/profileImage",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      if (image) URL.revokeObjectURL(image);
      setImage(imageUrl);
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęcia profilowego:", error);
    }
  };

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

  return (
    <>
      <div className="profile-page">
        <img className="profile-picture" src={image || defaultPfp} />
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
        <p>Hasło (hash): {basicUserData.password}</p>
      </div>
    </>
  );
}
