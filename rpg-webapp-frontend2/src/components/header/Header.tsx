import { NavLink, useNavigate } from "react-router";
import "./Header.css";
import { NotificationBell } from "../notifications/NotificationBell";
import { WSProvider } from "../../ws/WSProvider";

type HeaderProps = {
  logedIn: boolean;
  setLogedIn: (logedIn: boolean) => void;
};

export function Header({ logedIn, setLogedIn }: HeaderProps) {
  const baseUrl = "http://localhost:8080";
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setLogedIn(false);
    navigate("/");
  };

  return (
    <div className="header">
      <div className="left-section">
        <p>RPG</p>
      </div>

      {logedIn ? (
        <div className="middle-section">
          <NavLink className="header-link" to="/campaigns">
            <span className="link-text">Campaigns</span>
          </NavLink>

          <NavLink className="header-link" to="/characters">
            <span className="link-text">Characters</span>
          </NavLink>

          <NavLink className="header-link" to="/upcoming-sessions">
            <span className="link-text">Upcoming Sessions</span>
          </NavLink>
        </div>
      ) : (
        <></>
      )}

      <div className="right-section">
        {logedIn ? (
          <>
            <WSProvider baseUrl={baseUrl}>
              {" "}
              <NotificationBell />
            </WSProvider>

            <NavLink to="/profile">
              <button className="btn btn-primary navbar-btn">Profile</button>
            </NavLink>

            <button
              onClick={handleLogout}
              className="btn btn-secondary navbar-btn"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">
              <button className="btn btn-primary navbar-btn">Login</button>
            </NavLink>
            <NavLink to="/register">
              <button className="btn btn-secondary navbar-btn">Register</button>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}
