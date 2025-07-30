import { NavLink } from "react-router";
import "./Header.css";
export function Header() {
  return (
    <div className="header">
      <div className="left-section">
        <p>RPG</p>
      </div>

      <div className="middle-section">
        <NavLink className="header-link" to="/campaigns">
          <span className="link-text">Campaigns</span>
        </NavLink>

        <NavLink className="header-link" to="/characters">
          <span className="link-text">Characters</span>
        </NavLink>
      </div>

      <div className="right-section">
        <NavLink to="/login">
          <button>Login</button>
        </NavLink>
        <NavLink to="/register">
          <button>Register</button>
        </NavLink>
      </div>
    </div>
  );
}
