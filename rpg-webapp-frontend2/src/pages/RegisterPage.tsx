import { useState } from "react";
import "./RegisterPage.css";
import { useNavigate } from "react-router";
import axios from "axios";

type RegisterPageProps = { setLogedIn: (logedIn: boolean) => void };

export function RegisterPage({ setLogedIn }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await axios.post(
      "http://localhost:8080/api/auth/register",
      {
        nickname,
        email,
        password,
      }
    );
    const { token } = response.data;
    localStorage.setItem("token", token);
    setLogedIn(true);
    alert("Register succesfull");

    navigate("/");
  };

  return (
    <>
      <div className="register-page">
        <div className="register-form-container">
          <p>Register</p>
          <form onSubmit={handleRegister} className="register-form">
            <div>
              <input
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
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
            </div>

            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </>
  );
}
