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

  const checkIfLogedIn = () => {
    if (localStorage.getItem("token")) {
      setLogedIn(true);
    } else {
      setLogedIn(false);
    }
  };

  useEffect(() => {
    checkIfLogedIn();
  }, []);

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
        <Route path="profile" element={<ProfilePage />} />
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
