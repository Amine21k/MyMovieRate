// src/pages/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";


export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [mot_de_passe, setMotDePasse] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, mot_de_passe });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (setUser) {
        setUser(res.data.user);
      }

      alert("Connexion réussie");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="container login-container">
      <div className="card login-card">
        <h2 className="page-title">Connexion</h2>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemple@mail.com"
            />
          </div>

          <div className="form-group">
            <label className="label">Mot de passe</label>
            <input
              className="input"
              type="password"
              value={mot_de_passe}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            Se connecter
          </button>

          <p className="login-register-text">
            Pas encore de compte ?{" "}
            <Link to="/register" className="login-register-link">
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
