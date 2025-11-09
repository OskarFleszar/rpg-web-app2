import { NavLink, useNavigate } from "react-router";
import "./Header.css";

type HeaderProps = {
  logedIn: boolean;
  setLogedIn: (logedIn: boolean) => void;
};

export function Header({ logedIn, setLogedIn }: HeaderProps) {
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
            <NavLink to="/profile">
              <button>Profile</button>
            </NavLink>

            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">
              <button>Login</button>
            </NavLink>
            <NavLink to="/register">
              <button>Register</button>
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}
