import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Profile.sass";

function Profile() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [image, setImage] = useState(null);

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/profileImage",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "arraybuffer",
        }
      );

      const base64Image = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      setImageUrl(`data:image/jpeg;base64,${base64Image}`);
    } catch (error) {
      console.error("Błąd przy pobieraniu zdjęcia profilowego:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/user/one", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setNickname(response.data.nickname);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Błąd przy pobieraniu danych użytkownika:", error);
      }
    };

    fetchUserData();
    fetchProfileImage();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempNickname(nickname);
    setTempEmail(email);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempNickname(nickname);
    setTempEmail(email);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("file", image);

    try {
      await axios.post(
        "http://localhost:8080/api/user/uploadProfileImage",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Profile picture uppdated");
      fetchProfileImage();
    } catch (error) {
      console.error("Błąd podczas przesyłania obrazu: ", error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:8080/api/user",
        {
          nickname: tempNickname,
          email: tempEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNickname(tempNickname);
      setEmail(tempEmail);
      setIsEditing(false);
      alert("Dane zostały zaktualizowane");
    } catch (error) {
      console.error("Błąd podczas zapisywania zmian:", error);
    }
  };

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <div className="profile-image">
        {imageUrl ? (
          isEditing ? (
            <>
              <img className="img" src={imageUrl} alt="Profile" />
              <div className="custom-file-upload">
                <label htmlFor="fileInput" className="file-label">
                  Choose File
                </label>
                <input
                  id="fileInput"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <span className="file-status">
                  {image ? image.name : "No file chosen"}
                </span>
              </div>
              <button onClick={handleImageUpload}>Confirm photo</button>
            </>
          ) : (
            <img className="img" src={imageUrl} alt="Profile" />
          )
        ) : (
          <>
            <div className="custom-file-upload">
              <label htmlFor="fileInput" className="file-label">
                Choose File
              </label>
              <input
                id="fileInput"
                type="file"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <span className="file-status">
                {image ? image.name : "No file chosen"}
              </span>
            </div>

            {image ? (
              <button onClick={handleImageUpload}>Confirm photo</button>
            ) : (
              <> </>
            )}
          </>
        )}
      </div>

      {isEditing ? (
        <div className="edit-section">
          <div>
            <label>Nickname:</label>
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
            />
          </div>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <>
          <p>
            <strong>Nickname:</strong> {nickname}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          <button onClick={handleEdit}>Edit</button>
        </>
      )}
    </div>
  );
}

export default Profile;
