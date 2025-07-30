import { useState, useEffect, useRef } from "react";
import { over } from "stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import axios from "axios";
import "../styles/Chat.sass";

let stompClient = null;

const Chat = ({ campaignId }) => {
  const [publicChats, setPublicChats] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem("userData"));
  const [userData, setUserData] = useState({
    nickname: loggedInUser.nickname,
    connected: false,
    message: "",
  });
  const [rollData, setRollData] = useState({
    rollType: "d100",
    numberOfDice: 1,
    rollFor: "Other",
  });
  //const [bonus, setBonus] = useState(0);
  const selectedCharacter = JSON.parse(
    localStorage.getItem("selectedCharacter")
  );
  const token = localStorage.getItem("token");
  const subscribedRef = useRef(false);

  const connectUser = () => {
    if (stompClient && stompClient.connected) return;

    const Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);

    stompClient.connect(
      { Authorization: `Bearer ${token}` },
      onConnected,
      onError
    );
  };

  const onConnected = () => {
    setUserData((prevData) => ({ ...prevData, connected: true }));

    if (!subscribedRef.current) {
      stompClient.subscribe(`/chatroom/${campaignId}`, onPublicMessageReceived);
      subscribedRef.current = true;
    }
  };

  const onPublicMessageReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);

    console.log("Otrzymana wiadomość:", payloadData);

    if (payloadData.content) {
      console.log("To jest wiadomość tekstowa.");

      setPublicChats((prevChats) => [
        ...prevChats,
        {
          ...payloadData,
          timestamp: payloadData.timestamp || payloadData.messageTime,
        },
      ]);
    } else if (payloadData.rollResult) {
      console.log("To jest wynik rzutu.");

      setPublicChats((prevChats) => [...prevChats, payloadData]);
    } else {
      console.warn("Nieznany typ wiadomości:", payloadData);
    }
  };

  const onError = (err) => {
    console.error("Error connecting to WebSocket:", err);
    setUserData((prevData) => ({ ...prevData, connected: false }));
  };

  const handleMessageChange = (event) => {
    setUserData({ ...userData, message: event.target.value });
  };

  const handleRollTypeChange = (event) => {
    setRollData({ ...rollData, rollType: event.target.value });
  };

  const handleRollForChange = (event) => {
    const selectedRollFor = event.target.value;

    setRollData((prevData) => ({
      ...prevData,
      rollFor: selectedRollFor,
      rollType: selectedRollFor !== "Other" ? "d100" : prevData.rollType,
      numberOfDice: selectedRollFor !== "Other" ? 1 : prevData.numberOfDice,
    }));
  };

  const handleNumberOfDiceChange = (event) => {
    setRollData({ ...rollData, numberOfDice: parseInt(event.target.value) });
  };

  const handleBonusChange = (event) => {
    let value = parseInt(event.target.value, 10);

    if (value > 30) {
      value = 30;
    } else if (value < -30) {
      value = -30;
    }

    setRollData((prevData) => ({
      ...prevData,
      bonus: value,
    }));
  };

  const sendMessage = () => {
    if (
      stompClient &&
      stompClient.connected &&
      userData.message.trim() !== ""
    ) {
      const chatMessage = {
        content: userData.message,
        userId: loggedInUser.userId,
        nickname: loggedInUser.nickname,
        timestamp: new Date().toISOString(),
      };
      stompClient.send(
        `/app/message/${campaignId}`,
        {},
        JSON.stringify(chatMessage)
      );
      setUserData({ ...userData, message: "" });
    }
  };

  const sendRoll = () => {
    if (stompClient && stompClient.connected) {
      const rollMessage = {
        rollType: rollData.rollType,
        rollFor: rollData.rollFor,
        numberOfDice: rollData.numberOfDice,
        userId: loggedInUser.userId,
        nickname: loggedInUser.nickname,
        characterId: selectedCharacter.characterId,
        bonus: rollData.bonus,
      };
      stompClient.send(
        `/app/roll/${campaignId}`,
        {},
        JSON.stringify(rollMessage)
      );
    }
  };

  useEffect(() => {
    connectUser();

    axios
      .get(`http://localhost:8080/api/chat/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPublicChats(response.data);
        console.log(response.data);
      })
      .catch((error) => console.error("Failed to fetch chat history:", error));

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
          console.log("Disconnected WebSocket connection.");
        });
      }

      subscribedRef.current = false;
    };
  }, [campaignId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleString("default", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Chat</div>
      <div className="chat-messages">
        {publicChats.map((chat, index) => (
          <div
            key={index}
            className="chat-message"
            title={formatDate(chat.timestamp || chat.rollTime)}
          >
            <strong>{chat.nickname || "Unknown user"}</strong>:{" "}
            {chat.content ? (
              chat.content.includes("Result:") ? (
                (() => {
                  const [beforeResult, resultPart] =
                    chat.content.split("Result:");
                  return (
                    <span>
                      {beforeResult}
                      <span
                        style={{
                          color:
                            chat.outcome === "success"
                              ? "green"
                              : chat.outcome === "fail"
                              ? "red"
                              : "white",
                        }}
                      >
                        Result: {resultPart}
                      </span>
                    </span>
                  );
                })()
              ) : (
                <span>{chat.content}</span>
              )
            ) : (
              <>
                Rolled for: {chat.rollFor || "Unknown"} using{" "}
                {chat.numberOfDice || 0} x {chat.rollType || "Unknown"}{" "}
                <span
                  style={{
                    color:
                      chat.outcome === "success"
                        ? "green"
                        : chat.outcome === "fail"
                        ? "red"
                        : "white",
                  }}
                >
                  Result: [{chat.singleDiceResult?.join(", ") || "No data"}] ={" "}
                  {chat.rollResult || "Unknown"}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type in a message..."
          value={userData.message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div className="chat-input">
        <select
          value={rollData.rollType}
          onChange={handleRollTypeChange}
          disabled={rollData.rollFor !== "Other"}
        >
          <option value="d4">d4</option>
          <option value="d6">d6</option>
          <option value="d8">d8</option>
          <option value="d10">d10</option>
          <option value="d12">d12</option>
          <option value="d20">d20</option>
          <option value="d100">d100</option>
        </select>

        <select value={rollData.rollFor} onChange={handleRollForChange}>
          <option value="Disguise">Disguise</option>
          <option value="Command">Command</option>
          <option value="Gamble">Gamble</option>
          <option value="Ride">Ride</option>
          <option value="Consume Alcohol">Consume Alcohol</option>
          <option value="Animal Care">Animal Care</option>
          <option value="Gossip">Gossip</option>
          <option value="Swim">Swim</option>
          <option value="Drive">Drive</option>
          <option value="Charm">Charm</option>
          <option value="Search">Search</option>
          <option value="Silent Move">Silent Move</option>
          <option value="Perception">Perception</option>
          <option value="Outdoor Survival">Outdoor Survival</option>
          <option value="Haggle">Haggle</option>
          <option value="Concealment">Concealment</option>
          <option value="Row">Row</option>
          <option value="Scale Sheer Surface">Scale Sheer Surface</option>
          <option value="Evaluate">Evaluate</option>
          <option value="Intimidate">Intimidate</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="number"
          min="1"
          value={rollData.numberOfDice}
          onChange={handleNumberOfDiceChange}
          placeholder="Number of dice"
          disabled={rollData.rollFor !== "Other"}
        />
        <h4>Bonus:</h4>
        <input
          type="number"
          min="0"
          value={rollData.bonus}
          onChange={handleBonusChange}
          placeholder="Bonus"
        />
        <button onClick={sendRoll}>Roll</button>
      </div>
    </div>
  );
};

export default Chat;
