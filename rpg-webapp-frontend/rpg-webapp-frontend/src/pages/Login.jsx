import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RegisterLogin.sass";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/authenticate",
        {
          email,
          password,
        }
      );
      const { token } = response.data;
      localStorage.setItem("token", token);
      console.log("Zalogowano pomyślnie:", token);
      fetchUserData();

      const loginEvent = new Event("login");
      window.dispatchEvent(loginEvent);

      navigate("/");
    } catch (error) {
      setError("Nieprawidłowy email lub hasło");
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/one", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.setItem("userData", JSON.stringify(response.data));
    } catch (error) {
      console.error("Błąd przy pobieraniu danych użytkownika:", error);
    }
  };

  return (
    <div className="main">
      <div className="form-container">
        <div className="form-box">
          <h2>Sign In</h2>
          <form onSubmit={handleLogin}>
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
            {error && <p>{error}</p>}
            <button type="submit">Log In</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
