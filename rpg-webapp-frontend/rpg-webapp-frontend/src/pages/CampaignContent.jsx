import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Chat from "../components/Chat";
import DrawingBoard from "../components/DrawingBoard";
import "../styles/CampaignContent.sass";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CampaignContent = () => {
  const { id } = useParams();
  const [addUserNickname, setAddUserNickname] = useState("");
  const [showAddUserInput, setShowAddUserInput] = useState(false);
  const [isGameMaster, setIsGameMaster] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/campaign/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const loggedInUser = JSON.parse(localStorage.getItem("userData"));
        console.log("Game Master ID:", response.data.gameMaster.userId);
        console.log("Logged-in User ID:", loggedInUser.userId);

        if (
          response.data.gameMaster.userId === parseInt(loggedInUser.userId, 10)
        ) {
          setIsGameMaster(true);
        } else {
          setIsGameMaster(false);
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      }
    };

    fetchCampaignData();
  }, [id]);

  useEffect(() => {
    const selectedCharacter = localStorage.getItem("selectedCharacter");
    if (!selectedCharacter) {
      navigate(`/campaigns/${id}/select-character`);
    }
  }, [id, navigate]);

  const handleAddPlayer = async () => {
    try {
      await axios.post(
        `http://localhost:8080/api/campaign/${id}/add`,
        { nickname: addUserNickname },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAddUserNickname("");
      setShowAddUserInput(false);
    } catch (error) {
      console.error("Błąd podczas dodawania użytkownika:", error);
    }
  };

  return (
    <div>
      <div className="left-panel">
        {isGameMaster &&
          (showAddUserInput ? (
            <div>
              <input
                type="text"
                placeholder="Nickname"
                value={addUserNickname}
                onChange={(e) => setAddUserNickname(e.target.value)}
              />
              <button onClick={handleAddPlayer}>Add</button>
              <button onClick={() => setShowAddUserInput(false)}>Cancel</button>
            </div>
          ) : (
            <button
              className="add-player"
              onClick={() => setShowAddUserInput(true)}
            >
              Add a new user
            </button>
          ))}
      </div>
      <div className="campaign-container">
        <div>
          <DrawingBoard campaignId={id} isGameMaster={isGameMaster} />
        </div>
        <div className="chat-container">
          <Chat campaignId={id} />
        </div>
      </div>
    </div>
  );
};

export default CampaignContent;
