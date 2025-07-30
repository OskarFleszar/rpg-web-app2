import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Navbar.sass";

function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
    }

    const handleLogin = () => {
      setLoggedIn(true);
    };

    const handleLogout = () => {
      setLoggedIn(false);
    };

    window.addEventListener("login", handleLogin);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("login", handleLogin);
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1>RPG</h1>
      </div>
      <div className="navbar-center">
        <Link to="/">Home</Link>
        {loggedIn && <Link to="/campaigns">Campaigns</Link>}
        {loggedIn && <Link to="/characters">Characters</Link>}
      </div>
      <div className="navbar-right">
        {loggedIn ? (
          <>
            <Link to="/profile">
              <button>Profile</button>
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button>Login</button>
            </Link>
            <Link to="/register">
              <button>Register</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
