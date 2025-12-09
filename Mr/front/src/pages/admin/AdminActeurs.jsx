// src/pages/admin/AdminActeurs.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "../../styles/AdminActeurs.css";

export default function AdminActeurs() {
  const [acteurs, setActeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // formulaire
  const [editingId, setEditingId] = useState(null);
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [biographie, setBiographie] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // recherche + tri
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("recent"); // recent, nom_asc, nom_desc, date_desc, date_asc

  const resetForm = () => {
    setEditingId(null);
    setNom("");
    setDateNaissance("");
    setBiographie("");
    setPhotoUrl("");
  };

  const fetchActeurs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/acteurs");
      // même format que /films : { data: [...] }
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setActeurs(list);
    } catch (err) {
      console.error("Erreur chargement acteurs :", err);
      setError("Erreur lors du chargement des acteurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActeurs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nom,
      date_naissance: dateNaissance || null,
      biographie,
      photo_url: photoUrl || null,
    };

    try {
      setError("");

      if (editingId) {
        await api.patch(`/acteurs/${editingId}`, payload);
      } else {
        await api.post("/acteurs", payload);
      }

      await fetchActeurs();
      resetForm();
    } catch (err) {
      console.error("Erreur enregistrement acteur :", err);
      setError("Erreur lors de l’enregistrement de l’acteur.");
    }
  };

  const handleEdit = (acteur) => {
    setEditingId(acteur.id);
    setNom(acteur.nom || "");
    // si date_naissance est "2024-11-25T00:00:00.000Z" → on garde que AAAA-MM-JJ
    const dateStr = acteur.date_naissance
      ? acteur.date_naissance.substring(0, 10)
      : "";
    setDateNaissance(dateStr);
    setBiographie(acteur.biographie || "");
    setPhotoUrl(acteur.photo_url || "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet acteur ?")) return;

    try {
      setError("");
      await api.delete(`/acteurs/${id}`);
      setActeurs((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Erreur suppression acteur :", err);
      setError("Erreur lors de la suppression de l’acteur.");
    }
  };

  // ---- LOGIQUE RECHERCHE + TRI ----
  const getFilteredAndSortedActeurs = () => {
    if (!Array.isArray(acteurs)) return [];

    const term = search.trim().toLowerCase();

    let filtered = acteurs;

    if (term) {
      filtered = acteurs.filter((a) => {
        const nom = (a.nom || "").toLowerCase();
        const bio = (a.biographie || "").toLowerCase();
        return nom.includes(term) || bio.includes(term);
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      const aNom = (a.nom || "").toLowerCase();
      const bNom = (b.nom || "").toLowerCase();

      const aDate = a.date_naissance
        ? new Date(a.date_naissance).getTime()
        : 0;
      const bDate = b.date_naissance
        ? new Date(b.date_naissance).getTime()
        : 0;

      switch (sortKey) {
        case "nom_asc":
          return aNom.localeCompare(bNom);
        case "nom_desc":
          return bNom.localeCompare(aNom);
        case "date_asc":
          return aDate - bDate;
        case "date_desc":
          return bDate - aDate;
        case "recent":
        default:
          // plus récent = id le plus grand
          return (b.id || 0) - (a.id || 0);
      }
    });

    return sorted;
  };

  const filteredActeurs = getFilteredAndSortedActeurs();

  // 🔹 Limiter le nombre d'acteurs affichés dans le tableau
  const MAX_ACTEURS_DISPLAY = 10; // change ce nombre si tu veux
  const limitedActeurs = filteredActeurs.slice(0, MAX_ACTEURS_DISPLAY);

  return (
    <div className="container admin-actors-page">
      {/* HEADER */}
      <div className="card admin-actors-header admin-card-elevated">
        <div>
          <h1 className="page-title">Admin – Acteurs</h1>
          <p className="admin-subtitle">
            Gère les fiches acteurs : identité, photo et biographie.
          </p>
        </div>
        <div className="admin-header-right">
          <Link to="/admin" className="btn btn-ghost">
            ← Dashboard
          </Link>
          <span className="admin-badge">
            {acteurs.length} acteur{acteurs.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {error && (
        <div className="card admin-error admin-card-elevated">
          <p>{error}</p>
        </div>
      )}

      <div className="admin-actors-content">
        {/* FORMULAIRE */}
        <div className="card admin-form-card admin-card-elevated">
          <h2 className="admin-section-title">
            {editingId ? "Modifier un acteur" : "Ajouter un acteur"}
          </h2>
          {editingId && (
            <p className="admin-edit-info">
              ✏️ Vous modifiez l’acteur <strong>#{editingId}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label className="label">Nom</label>
              <input
                className="input"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Date de naissance</label>
              <input
                className="input"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Biographie</label>
              <textarea
                className="input input-textarea"
                rows={3}
                value={biographie}
                onChange={(e) => setBiographie(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Photo URL</label>
              <input
                className="input"
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId
                  ? "Enregistrer les modifications"
                  : "Ajouter l’acteur"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTE DES ACTEURS */}
        <div className="card admin-list-card admin-card-elevated">
          <div className="admin-list-header">
            <h2 className="admin-section-title">Liste des acteurs</h2>

            {/* TOOLBAR RECHERCHE + TRI */}
            <div className="admin-list-toolbar">
              <input
                type="text"
                className="input admin-search-input"
                placeholder="Rechercher par nom ou biographie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="input admin-sort-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="recent">Plus récents</option>
                <option value="nom_asc">Nom A → Z</option>
                <option value="nom_desc">Nom Z → A</option>
                <option value="date_desc">
                  Date de naissance (plus récents)
                </option>
                <option value="date_asc">
                  Date de naissance (plus anciens)
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : !Array.isArray(acteurs) || acteurs.length === 0 ? (
            <p>Aucun acteur pour le moment.</p>
          ) : filteredActeurs.length === 0 ? (
            <p>Aucun acteur ne correspond à votre recherche.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-actors-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Date de naissance</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {limitedActeurs.map((acteur) => {
                    const isEditing = acteur.id === editingId;
                    const dateAffiche = acteur.date_naissance
                      ? new Date(acteur.date_naissance).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-";

                    return (
                      <tr
                        key={acteur.id}
                        className={isEditing ? "row-editing" : ""}
                      >
                        <td>{acteur.id}</td>
                        <td>
                          <div className="actor-photo-cell">
                            {acteur.photo_url ? (
                              <img
                                src={acteur.photo_url}
                                alt={acteur.nom}
                                className="actor-photo-thumb"
                              />
                            ) : (
                              <div className="actor-photo-placeholder">
                                {acteur.nom?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{acteur.nom}</td>
                        <td>{dateAffiche}</td>
                        <td className="col-actions">
                          <button
                            className="btn btn-small"
                            onClick={() => handleEdit(acteur)}
                          >
                            Modifier
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDelete(acteur.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredActeurs.length > MAX_ACTEURS_DISPLAY && (
                <p className="admin-list-info">
                  Affichage des {MAX_ACTEURS_DISPLAY} premiers résultats sur{" "}
                  {filteredActeurs.length}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
