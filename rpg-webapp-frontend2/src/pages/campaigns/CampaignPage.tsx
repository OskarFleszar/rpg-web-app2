import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import "./CampaignPage.css";
import { createStompClient } from "../../ws/client";
import { Chat } from "./Chat";
import { WSProvider } from "../../ws/WSProvider";

export function WsSmokeTest() {
  useEffect(() => {
    const client = createStompClient("http://localhost:8080");
    client.activate();
    return () => void client.deactivate();
  }, []);

  return null;
}

export function CampaignPage() {
  const baseUrl = "http://localhost:8080";
  const { id } = useParams();
  const [addingUser, setAddingUser] = useState(false);
  const [nicknameToAdd, setNicknameToAdd] = useState("");
  const [characters, setCharacters] = useState([]);
  const { state } = useLocation();
  const characterIds = state?.characterIds as number[];

  useEffect(() => {
    if (characterIds) {
      fetchCharactersData();
    }
  }, []);

  const fetchCharactersData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/character/chosencharacters",
        {
          params: { ids: characterIds.join(",") },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCharacters(response.data);
    } catch (error) {
      console.error("An error occured while fetching character data", error);
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post(
        `http://localhost:8080/api/campaign/${id}/add`,
        { nickname: nicknameToAdd },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNicknameToAdd("");
      setAddingUser(false);
    } catch (error) {
      console.error("An error occured while adding user", error);
    }
  };
  return (
    <div className="campaign-page">
      {addingUser ? (
        <div>
          <input
            type="text"
            placeholder="Nickname"
            value={nicknameToAdd}
            onChange={(e) => {
              setNicknameToAdd(e.target.value);
            }}
          />
          <button onClick={handleAddUser}>Add</button>
          <button onClick={() => setAddingUser(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAddingUser(true)}>Add a new user</button>
      )}

      <WSProvider baseUrl={baseUrl}>
        <Chat campaignId={id} characters={characters} />
      </WSProvider>
    </div>
  );
}
