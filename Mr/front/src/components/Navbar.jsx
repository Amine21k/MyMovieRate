// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const isAdmin =
    user && (user.role || "").toString().toLowerCase() === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="navbar">
      {/* Logo gauche */}
      <div className="navbar-left">
        <div className="navbar-dot" />
        <div className="navbar-logo">
          <Link to="/">MyMovieRate</Link>
        </div>
      </div>

      {/* Liens à droite */}
      <nav className="navbar-links">

        {/* Lien Admin */}
        {isAdmin && (
          <Link className="navbar-link" to="/admin">
            Dashboard
          </Link>
        )}

        {/*  lien vers la page Chatbot */}
        <Link className="navbar-link" to="/chatbot">
          🤖 Chatbot
        </Link>

        {/* Page compte */}
        <Link to="/mon-compte" className="navbar-link">
          Mon compte
        </Link>

        {/* Auth */}
        {user ? (
          <>
            <span className="navbar-link">👤 {user.nom}</span>
            <button className="btn-nav" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="navbar-link" to="/login">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
