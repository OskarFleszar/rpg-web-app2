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

  useEffect(() => {
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
        setImage(imageUrl);
      } catch (error) {
        console.error("Błąd przy pobieraniu zdjęcia profilowego:", error);
      }
    };
    fetchProfileImage();
    loadBasicUserData();
  }, []);

  return (
    <>
      <div className="profile-page">
        <img className="profile-picture" src={image || defaultPfp} />
        <p>Nickname: {basicUserData.nickname}</p>
        <p>Email: {basicUserData.email}</p>
        <p>Hasło (hash): {basicUserData.password}</p>
      </div>
    </>
  );
}
