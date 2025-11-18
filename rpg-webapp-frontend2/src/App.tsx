import { Route, Routes } from "react-router";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { CharactersPage } from "./pages/characters/CharactersPage";
import { CampaignsPage } from "./pages/campaigns/CampaignsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "./components/header/Header";
import { CharacterPage } from "./pages/characters/CharacterPage";
import { CreateCharacterPage } from "./pages/characters/CreateCharacterPage";
import { CampaignPage } from "./pages/campaigns/CampaignPage";
import { CharacterSelectScreen } from "./pages/campaigns/CharacterSelectScreen";
import { UpcomingSessionsPage } from "./pages/upcoming-sessions/UpcomingSessionsPage";
import { RequireAuth } from "./RequireAuth";
import { CreateCampaignPage } from "./pages/campaigns/CreateCampaignPage";

function App() {
  const [logedIn, setLogedIn] = useState(() => !!localStorage.getItem("token"));

  const loadUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/one/id",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      localStorage.setItem("userId", response.data);
    } catch (error) {
      localStorage.removeItem("token");
      setLogedIn(false);
      console.error("An error occured while fetchung user id:", error);
    }
  };

  useEffect(() => {
    if (logedIn) {
      loadUserData();
    }
  }, [logedIn]);

  return (
    <>
      <Header logedIn={logedIn} setLogedIn={setLogedIn} />
      <Routes>
        <Route
          path="register"
          element={<RegisterPage setLogedIn={setLogedIn} />}
        />
        <Route path="login" element={<LoginPage setLogedIn={setLogedIn} />} />

        <Route element={<RequireAuth logedIn={logedIn} />}>
          <Route index element={<HomePage />} />
          <Route path="characters" element={<CharactersPage />} />
          <Route path="characters/:id" element={<CharacterPage />} />
          <Route path="characters/create" element={<CreateCharacterPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/create" element={<CreateCampaignPage />} />
          <Route
            path="campaigns/:id/characterselect"
            element={<CharacterSelectScreen />}
          />
          <Route path="campaigns/:id" element={<CampaignPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="upcoming-sessions" element={<UpcomingSessionsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
