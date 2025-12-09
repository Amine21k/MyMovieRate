import { useState } from "react";
import api from "../api";

export default function Register() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (motDePasse !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        nom,
        email,
        mot_de_passe: motDePasse,
      });

      setSuccessMsg("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      // Optionnel : rediriger automatiquement après 1–2 secondes
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError("Erreur lors de l’inscription.");
      }
    }
  };

  return (
    <div className="container">
      <div className="card form-card">
        <h2 className="page-title">Créer un compte</h2>
        <p className="page-subtitle">
          Inscrivez-vous pour noter les films et laisser des critiques.
        </p>

        {error && <p style={{ color: "#f97373", marginBottom: 10 }}>{error}</p>}
        {successMsg && (
          <p style={{ color: "#4ade80", marginBottom: 10 }}>{successMsg}</p>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="label">Nom</label>
            <input
              className="input"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              placeholder="Votre nom"
            />
          </div>

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
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="label">Confirmer le mot de passe</label>
            <input
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
            S’inscrire
          </button>
        </form>

        <p style={{ marginTop: 12, fontSize: 13 }}>
          Déjà un compte ?{" "}
          <a href="/login" style={{ textDecoration: "underline" }}>
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
