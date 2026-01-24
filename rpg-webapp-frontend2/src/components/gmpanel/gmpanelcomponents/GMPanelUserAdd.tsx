import axios from "axios";
import { useState } from "react";
import { API_URL } from "../../../config";

type GMPanelUserAddProps = {
  isGM: boolean;
  campaignId: string | undefined;
};

export function GMPanelUserAdd({ isGM, campaignId }: GMPanelUserAddProps) {
  const [addingUser, setAddingUser] = useState(false);
  const [nicknameToAdd, setNicknameToAdd] = useState("");

  const handleInviteUser = async () => {
    try {
      if (!isGM) return;
      await axios.post(
        `${API_URL}/api/campaign/${campaignId}/sendInvite`,
        { nickname: nicknameToAdd },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setNicknameToAdd("");
      setAddingUser(false);
    } catch (error) {
      console.error("An error occured while adding user", error);
    }
  };

  return (
    <>
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
          <button className="confirm-button" onClick={handleInviteUser}>
            ✔️
          </button>
          <button onClick={() => setAddingUser(false)}>❌</button>
        </div>
      ) : (
        <button className="gm-panel-button" onClick={() => setAddingUser(true)}>
          👤➕
        </button>
      )}
    </>
  );
}
