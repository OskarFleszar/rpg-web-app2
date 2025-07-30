import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Characters from "./pages/Characters";
import CharacterForm from "./pages/CharacterForm";
import Campaigns from "./pages/Campaigns";
import CampaignContent from "./pages/CampaignContent";
import CharacterSelectMenu from "./components/CharacterSelectMenu";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignContent />} />
        <Route
          path="/campaigns/:id/select-character"
          element={<CharacterSelectMenu />}
        />
        <Route path="/characters/:id" element={<CharacterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/character-creator" element={<CharacterForm />} />
      </Routes>
    </Router>
  );
}

export default App;
