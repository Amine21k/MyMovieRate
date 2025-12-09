// src/pages/admin/AdminDashboard.jsx
import { Link } from "react-router-dom";
import { FaFilm, FaUser, FaUsersCog, FaComments } from "react-icons/fa";
import "../../styles/admin.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-bg-orb" />
      <div className="admin-dashboard-bg-orb orb-2" />

      <div className="admin-dashboard-card">
        <div className="admin-dashboard-header">
          <span className="admin-badge-pill">ADMIN PANEL</span>
          <h1 className="admin-dashboard-title">Espace administrateur</h1>
          <p className="admin-dashboard-subtitle">
            Retrouvez ici toutes les sections pour gérer le contenu du site.
          </p>
        </div>

        <div className="admin-dashboard-links">
          {/* FILMS */}
          <Link to="/admin/films" className="admin-dashboard-link">
            <div className="admin-link-left">
              <FaFilm className="admin-dashboard-icon" />
              <div className="admin-link-text">
                <span className="admin-link-title">Films</span>
                <span className="admin-link-subtitle">
                  Ajouter, modifier ou supprimer des films.
                </span>
              </div>
            </div>
            <span className="admin-link-cta">Gérer →</span>
          </Link>

          {/* ACTEURS */}
          <Link to="/admin/acteurs" className="admin-dashboard-link">
            <div className="admin-link-left">
              <FaUser className="admin-dashboard-icon" />
              <div className="admin-link-text">
                <span className="admin-link-title">Acteurs</span>
                <span className="admin-link-subtitle">
                  Maintenir le casting et les fiches acteurs.
                </span>
              </div>
            </div>
            <span className="admin-link-cta">Gérer →</span>
          </Link>

          {/* UTILISATEURS */}
          <Link to="/admin/utilisateurs" className="admin-dashboard-link">
            <div className="admin-link-left">
              <FaUsersCog className="admin-dashboard-icon" />
              <div className="admin-link-text">
                <span className="admin-link-title">Utilisateurs</span>
                <span className="admin-link-subtitle">
                  Gérer les comptes, rôles et accès.
                </span>
              </div>
            </div>
            <span className="admin-link-cta">Gérer →</span>
          </Link>

          {/* CRITIQUES */}
                    <Link to="/admin/critiques" className="admin-dashboard-link">
            <div className="admin-link-left">
              <FaComments className="admin-dashboard-icon" />
              <div className="admin-link-text">
                <span className="admin-link-title">Critiques</span>
                <span className="admin-link-subtitle">
                  Gérer les avis laissés sur les films.
                </span>
              </div>
            </div>
            <span className="admin-link-cta">Gérer →</span>
          </Link>


        </div>
      </div>
    </div>
  );
}
