import axios from "axios";
import { useEffect, useState } from "react";
import "./ProfilePage.css";
import defaultPfp from "../../assets/images/nig.jpg";
import { ProfilePageContent } from "./ProfilePageContent";
import { ProfilePageEditing } from "./ProfilePageEditing";

export function ProfilePage() {
  const [basicUserData, setBasicUserData] = useState({
    nickname: "",
    email: "",
    password: "",
  });
  const [image, setImage] = useState<string | undefined>(undefined);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    fetchProfileImage();
    loadBasicUserData();
    console.log(localStorage.getItem("token"))
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
    console.log(response.data)
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
      setImage(defaultPfp);
    }
  };

  return (
    <>
      {isEditing ? (
        <ProfilePageEditing
          basicUserData={basicUserData}
          setBasicUserData={setBasicUserData}
          image={image}
          setIsEditing={setIsEditing}
          fetchProfileImage={fetchProfileImage}
          setImage={setImage}
        />
      ) : (
        <ProfilePageContent
          basicUserData={basicUserData}
          image={image}
          setIsEditing={setIsEditing}
        />
      )}
    </>
  );
}
