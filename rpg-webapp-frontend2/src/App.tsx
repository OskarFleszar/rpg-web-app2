import { Route, Routes } from "react-router";
import "./App.css";
import { HomePage } from "./pages/HomePage";

import { CampaignsPage } from "./pages/campaigns/allcampaignspage/CampaignsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";

import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "./components/header/Header";
import { CharacterPage } from "./pages/characters/singlecharacterpage/CharacterPage";
import { CreateCharacterPage } from "./pages/characters/CreateCharacterPage";
import { CampaignPage } from "./pages/campaigns/singlecampaignpage/CampaignPage";
import { CharacterSelectScreen } from "./pages/campaigns/CharacterSelectScreen";
import { UpcomingSessionsPage } from "./pages/upcoming-sessions/UpcomingSessionsPage";
import { RequireAuth } from "./RequireAuth";

import { SpellsCard } from "./pages/characters/SpellsCard/SpellsCard";
import { API_URL } from "./config";
import { RegisterPage } from "./pages/loginregister/RegisterPage";
import { LoginPage } from "./pages/loginregister/LoginPage";
import { CharactersPage } from "./pages/characters/allcharacterspage/CharactersPage";
import { CreateCampaignPage } from "./pages/campaigns/createcampaignpage/CreateCampaignPage";

function App() {
  const [logedIn, setLogedIn] = useState(() => !!localStorage.getItem("token"));

  const loadUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/one/id`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
          <Route path="characters/:id/spellcard" element={<SpellsCard />} />
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
