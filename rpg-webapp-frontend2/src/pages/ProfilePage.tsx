import axios from "axios";
import { useEffect, useState } from "react";
import "./ProfilePage.css";

export function ProfilePage() {
  const [basicUserData, setBasicUserData] = useState({
    nickname: "",
    email: "",
    password: "",
  });

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
    loadBasicUserData();
  }, []);

  return (
    <>
      <div className="profile-page">
        <p>Nickname: {basicUserData.nickname}</p>
        <p>Email: {basicUserData.email}</p>
        <p>Hasło (hash): {basicUserData.password}</p>
      </div>
    </>
  );
}
