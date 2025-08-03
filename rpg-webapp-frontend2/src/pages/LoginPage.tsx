import { useState } from "react";
import "./RegisterPage.css";
import { useNavigate } from "react-router";
import axios from "axios";

type RegisterPageProps = { setLogedIn: (logedIn: boolean) => void };

export function LoginPage({ setLogedIn }: RegisterPageProps) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
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
    <>
      <div className="register-page">
        <div className="register-form-container">
          <p>Login</p>
          <form onSubmit={handleLogin} className="register-form">
            <div>
              <input
                type="text"
                placeholder="Email adress"
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

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}
