// src/pages/admin/AdminCritiques.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "../../styles/AdminCritiques.css";

export default function AdminCritiques() {
  const [critiques, setCritiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const fetchCritiques = async () => {
    try {
      setLoading(true);
      setError("");

      
      const res = await api.get("/films/critiques");
      const list = Array.isArray(res.data) ? res.data : [];
      setCritiques(list);
    } catch (err) {
      console.error("Erreur chargement critiques admin :", err);
      setError("Erreur lors du chargement des critiques.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCritiques();
  }, []);

  const handleDelete = async (critique) => {
    const extrait = (critique.commentaire || "").slice(0, 40);
    const label = extrait ? `"${extrait}..."` : `#${critique.id}`;

    if (!window.confirm(`Supprimer cette critique : ${label} ?`)) return;

    try {
      setError("");
      
      await api.delete(`/films/critiques/${critique.id}`);
      setCritiques((prev) => prev.filter((c) => c.id !== critique.id));
    } catch (err) {
      console.error("Erreur suppression critique admin :", err);
      setError("Erreur lors de la suppression de la critique.");
    }
  };

  // ---- LOGIQUE RECHERCHE + TRI ----
  const getFilteredAndSortedCritiques = () => {
    if (!Array.isArray(critiques)) return [];

    const term = search.trim().toLowerCase();

    let filtered = critiques;

    //  Filtre par film, user, texte
    if (term) {
      filtered = critiques.filter((c) => {
        const filmTitre = (c.film_titre || "").toLowerCase();
        const userNom = (c.user_nom || "").toLowerCase();
        const commentaire = (c.commentaire || "").toLowerCase();

        return (
          filmTitre.includes(term) ||
          userNom.includes(term) ||
          commentaire.includes(term)
        );
      });
    }

    //  Tri : les plus récentes en premier (date_creation desc, puis id desc)
    const sorted = [...filtered].sort((a, b) => {
      const aDate = a.date_creation
        ? new Date(a.date_creation).getTime()
        : 0;
      const bDate = b.date_creation
        ? new Date(b.date_creation).getTime()
        : 0;

      if (bDate !== aDate) {
        return bDate - aDate; // plus récent en premier
      }

      // fallback : id le plus grand = plus récent
      return (b.id || 0) - (a.id || 0);
    });

    return sorted;
  };

  const filteredCritiques = getFilteredAndSortedCritiques();

  // 🔹 Limiter le nombre de critiques affichées dans le tableau
  const MAX_CRITIQUES_DISPLAY = 20; // change ce nombre si tu veux
  const limitedCritiques = filteredCritiques.slice(0, MAX_CRITIQUES_DISPLAY);

  return (
    <div className="container admin-critiques-page">
      {/* HEADER */}
      <div className="card admin-critiques-header admin-card-elevated">
        <div>
          <h1 className="page-title">Admin – Critiques</h1>
          <p className="admin-subtitle">
            Modère les critiques des films : recherche, consultation, suppression.
          </p>
        </div>
        <div className="admin-header-right">
          <Link to="/admin" className="btn btn-ghost">
            ← Dashboard
          </Link>
          <span className="admin-badge">
            {filteredCritiques.length} critique
            {filteredCritiques.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {error && (
        <div className="card admin-error admin-card-elevated">
          <p>{error}</p>
        </div>
      )}

      <div className="card admin-critiques-card admin-card-elevated">
        <div className="admin-list-header">
          <h2 className="admin-section-title">Liste des critiques</h2>

          <div className="admin-list-toolbar">
            <input
              type="text"
              className="input admin-search-input"
              placeholder="Rechercher par film, utilisateur ou texte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : filteredCritiques.length === 0 ? (
          <p className="admin-empty-text">Aucune critique trouvée.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-critiques-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Film</th>
                  <th>Utilisateur</th>
                  <th>Commentaire</th>
                  <th>Date</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {limitedCritiques.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      {c.film_titre ? (
                        <Link to={`/films/${c.film_id}`}>{c.film_titre}</Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-user-name">
                          {c.user_nom || "(Sans nom)"}
                        </span>
                        <span className="admin-user-email">
                          {c.user_email || ""}
                        </span>
                      </div>
                    </td>
                    <td className="admin-comment-cell">
                      {c.commentaire || "-"}
                    </td>
                    <td>
                      {c.date_creation
                        ? new Date(c.date_creation).toLocaleString("fr-FR")
                        : "-"}
                    </td>
                    <td className="col-actions">
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(c)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="admin-list-info">
              Affichage de {limitedCritiques.length} critique
              {limitedCritiques.length > 1 ? "s" : ""} sur{" "}
              {filteredCritiques.length}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
