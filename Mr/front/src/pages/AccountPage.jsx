import { useEffect, useState } from "react";
import api from "../api";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [profil, setProfil] = useState(null);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");

  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Charger /me au montage
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/me");
        setProfil(res.data);
        setNom(res.data.nom);
        setEmail(res.data.email);
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement du profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/me", { nom, email });
      alert("Profil mis à jour !");
      setProfil(res.data);

      // mettre à jour localStorage pour film critiques etc.
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du profil.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/me/password", {
        ancienMotDePasse: ancien,
        nouveauMotDePasse: nouveau,
      });
      alert("Mot de passe changé !");
      setAncien("");
      setNouveau("");
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de mot de passe.");
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="card">
          <p>Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="page-title">Mon compte</h2>

        {/* Section infos */}
        <form onSubmit={handleUpdateProfil} style={{ marginTop: 16 }}>
          <h3 className="section-title">Informations personnelles</h3>

          <div className="form-group">
            <label className="label">Nom</label>
            <input
              className="input"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="btn-primary">Mettre à jour</button>
        </form>

        {/* Section mot de passe */}
        <form
          onSubmit={handleChangePassword}
          style={{ marginTop: 30, maxWidth: 400 }}
        >
          <h3 className="section-title">Changer le mot de passe</h3>

          <div className="form-group">
            <label className="label">Ancien mot de passe</label>
            <input
              type="password"
              className="input"
              value={ancien}
              onChange={(e) => setAncien(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">Nouveau mot de passe</label>
            <input
              type="password"
              className="input"
              value={nouveau}
              onChange={(e) => setNouveau(e.target.value)}
            />
          </div>

          <button className="btn-primary">Changer le mot de passe</button>
        </form>
      </div>
    </div>
  );
}
