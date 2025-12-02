import { useState } from "react";
import "./RegisterPage.css";
import { useNavigate } from "react-router";
import axios from "axios";
import { BackgroundFog } from "../styles/stypecomponents/BackgroundFog";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { API_URL } from "../config";

type RegisterPageProps = { setLogedIn: (logedIn: boolean) => void };

export function RegisterPage({ setLogedIn }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      nickname,
      email,
      password,
    });
    const { token } = response.data;
    localStorage.setItem("token", token);
    setLogedIn(true);
    alert("Register succesfull");

    navigate("/");
  };

  return (
    <div className="page-wrapper">
      <div className="register-page">
        <div className="register-form-content">
          <p className="top-text">Register</p>
          <form onSubmit={handleRegister} className="register-form">
            <div>
              <input
                className="input-primary register-input"
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                }}
              />
            </div>
            <div>
              <input
                className="input-primary register-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
              />
            </div>
            <div className="password-wrapper">
              <input
                className="input-primary register-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {" "}
                {showPassword ? (
                  <EyeSlashIcon className="eye-icon" />
                ) : (
                  <EyeIcon className="eye-icon" />
                )}
              </button>{" "}
            </div>

            <button className="btn-primary register-button" type="submit">
              Register
            </button>
          </form>
        </div>
      </div>

      <BackgroundFog />
    </div>
  );
}
