import { Route, Routes } from "react-router";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { CharactersPage } from "./pages/CharactersPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "./components/Header";

function App() {
  //const [userData, setUserData] = useState({});
  const [logedIn, setLogedIn] = useState(false);
  const [userId, setUserId] = useState(0);

  const loadUserData = async () => {
    const response = await axios.get("http://localhost:8080/api/user/one", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setUserId(response.data.userId);
    console.log(userId);
  };

  const checkIfLogedIn = () => {
    if (localStorage.getItem("token") !== null) {
      setLogedIn(true);
    }
  };

  useEffect(() => {
    checkIfLogedIn();
    if (logedIn) {
      loadUserData();
    }
  }, [logedIn]);

  return (
    <>
      <Header logedIn={logedIn} setLogedIn={setLogedIn} />
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="profile" element={<ProfilePage userId={userId} />} />
        <Route
          path="register"
          element={<RegisterPage setLogedIn={setLogedIn} />}
        />
        <Route path="login" element={<LoginPage setLogedIn={setLogedIn} />} />
      </Routes>
    </>
  );
}

export default App;
