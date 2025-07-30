import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RegisterLogin.sass";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        nickname,
        email,
        password,
      });

      const response = await axios.post(
        "http://localhost:8080/api/auth/authenticate",
        {
          email,
          password,
        }
      );
      const { token } = response.data;

      localStorage.setItem("token", token);
      const loginEvent = new Event("login");
      window.dispatchEvent(loginEvent);

      const userResponse = await axios.get(
        "http://localhost:8080/api/user/one",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.setItem("userData", JSON.stringify(userResponse.data));

      navigate("/");
    } catch (error) {
      console.error("An error occured during register process:", error);
    }
  };

  return (
    <div className="main">
      <div className="form-container">
        <div className="form-box">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <div>
              <label>Nickname</label>
              <input
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
