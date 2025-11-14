import { useState } from "react";
import "./RegisterPage.css";
import { useNavigate } from "react-router";
import axios from "axios";
import { BackgroundFog } from "../styles/stypecomponents/BackgroundFog";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type RegisterPageProps = { setLogedIn: (logedIn: boolean) => void };

export function LoginPage({ setLogedIn }: RegisterPageProps) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await axios.post(
      "http://localhost:8080/api/auth/authenticate",
      {
        email,
        password,
      }
    );
    const { token } = response.data;
    localStorage.setItem("token", token);
    setLogedIn(true);
    alert("Login succesfull");

    navigate("/");
  };

  return (
    <div className="page-wrapper">
      <div className="register-page">
        <div className="register-form-content">
          <p className="top-text">Login</p>
          <form onSubmit={handleLogin} className="register-form">
            <div>
              <input
                className="input-primary register-input"
                type="text"
                placeholder="Email adress"
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
              Login
            </button>
          </form>
        </div>
      </div>

      <BackgroundFog />
    </div>
  );
}
