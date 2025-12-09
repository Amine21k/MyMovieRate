// src/pages/admin/AdminFilms.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "../../styles/AdminFilms.css";

export default function AdminFilms() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // formulaire
  const [editingId, setEditingId] = useState(null);
  const [titre, setTitre] = useState("");
  const [annee, setAnnee] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [afficheUrl, setAfficheUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");

  // recherche + tri
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("recent"); // recent, titre_asc, titre_desc, annee_desc, annee_asc

  const resetForm = () => {
    setEditingId(null);
    setTitre("");
    setAnnee("");
    setGenre("");
    setDescription("");
    setAfficheUrl("");
    setTrailerUrl("");
  };

  const fetchFilms = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/films");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setFilms(list);
    } catch (err) {
      console.error("Erreur chargement films :", err);
      setError("Erreur lors du chargement des films.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      titre,
      annee: annee ? Number(annee) : null,
      genre,
      description,
      affiche_url: afficheUrl || null,
      trailer_url: trailerUrl || null,
    };

    try {
      setError("");

      if (editingId) {
        await api.patch(`/films/${editingId}`, payload);
      } else {
        await api.post("/films", payload);
      }

      await fetchFilms();
      resetForm();
    } catch (err) {
      console.error("Erreur enregistrement film :", err);
      setError("Erreur lors de l’enregistrement du film.");
    }
  };

  const handleEdit = (film) => {
    setEditingId(film.id);
    setTitre(film.titre || "");
    setAnnee(film.annee ? String(film.annee) : "");
    setGenre(film.genre || "");
    setDescription(film.description || "");
    setAfficheUrl(film.affiche_url || "");
    setTrailerUrl(film.trailer_url || "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce film ?")) return;

    try {
      setError("");
      await api.delete(`/films/${id}`);
      setFilms((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Erreur suppression film :", err);
      setError("Erreur lors de la suppression du film.");
    }
  };

  // ---- LOGIQUE RECHERCHE + TRI ----
  const getFilteredAndSortedFilms = () => {
    if (!Array.isArray(films)) return [];

    const term = search.trim().toLowerCase();

    let filtered = films;

    if (term) {
      filtered = films.filter((f) => {
        const titre = (f.titre || "").toLowerCase();
        const genre = (f.genre || "").toLowerCase();
        return titre.includes(term) || genre.includes(term);
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      const aTitre = (a.titre || "").toLowerCase();
      const bTitre = (b.titre || "").toLowerCase();
      const aAnnee = a.annee || 0;
      const bAnnee = b.annee || 0;

      switch (sortKey) {
        case "titre_asc":
          return aTitre.localeCompare(bTitre);
        case "titre_desc":
          return bTitre.localeCompare(aTitre);
        case "annee_asc":
          return aAnnee - bAnnee;
        case "annee_desc":
          return bAnnee - aAnnee;
        case "recent":
        default:
          // on utilise l'id comme ordre d'ajout (plus grand = plus récent)
          return (b.id || 0) - (a.id || 0);
      }
    });

    return sorted;
  };

  const filteredFilms = getFilteredAndSortedFilms();

  // 🔹 Limiter le nombre de films affichés dans le tableau
  const MAX_FILMS_DISPLAY = 10; // tu peux changer ce nombre
  const limitedFilms = filteredFilms.slice(0, MAX_FILMS_DISPLAY);

  return (
    <div className="container admin-films-page">
      {/* HEADER */}
      <div className="card admin-films-header admin-card-elevated">
        <div>
          <h1 className="page-title">Admin – Films</h1>
          <p className="admin-subtitle">
            Gère le catalogue : ajoute, modifie ou supprime des films.
          </p>
        </div>
        <div className="admin-header-right">
          <Link to="/admin" className="btn btn-ghost">
            ← Dashboard
          </Link>
          <span className="admin-badge">
            {films.length} film{films.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {error && (
        <div className="card admin-error admin-card-elevated">
          <p>{error}</p>
        </div>
      )}

      <div className="admin-films-content">
        {/* FORMULAIRE */}
        <div className="card admin-form-card admin-card-elevated">
          <h2 className="admin-section-title">
            {editingId ? "Modifier un film" : "Ajouter un film"}
          </h2>
          {editingId && (
            <p className="admin-edit-info">
              ✏️ Vous modifiez le film <strong>#{editingId}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label className="label">Titre</label>
              <input
                className="input"
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="form-group">
                <label className="label">Année</label>
                <input
                  className="input"
                  type="number"
                  value={annee}
                  onChange={(e) => setAnnee(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Genre</label>
                <input
                  className="input"
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Description</label>
              <textarea
                className="input input-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Affiche URL</label>
              <input
                className="input"
                type="text"
                value={afficheUrl}
                onChange={(e) => setAfficheUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label className="label">Trailer URL</label>
              <input
                className="input"
                type="text"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId
                  ? "Enregistrer les modifications"
                  : "Ajouter le film"}
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

        {/* LISTE DES FILMS */}
        <div className="card admin-list-card admin-card-elevated">
          <div className="admin-list-header">
            <h2 className="admin-section-title">Liste des films</h2>

            {/* TOOLBAR RECHERCHE + TRI */}
            <div className="admin-list-toolbar">
              <input
                type="text"
                className="input admin-search-input"
                placeholder="Rechercher par titre ou genre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="input admin-sort-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="recent">Plus récents</option>
                <option value="titre_asc">Titre A → Z</option>
                <option value="titre_desc">Titre Z → A</option>
                <option value="annee_desc">Année décroissante</option>
                <option value="annee_asc">Année croissante</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : !Array.isArray(films) || films.length === 0 ? (
            <p>Aucun film pour le moment.</p>
          ) : filteredFilms.length === 0 ? (
            <p>Aucun film ne correspond à votre recherche.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-films-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Affiche</th>
                    <th>Titre</th>
                    <th>Année</th>
                    <th>Genre</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {limitedFilms.map((film) => {
                    const isEditing = film.id === editingId;
                    return (
                      <tr
                        key={film.id}
                        className={isEditing ? "row-editing" : ""}
                      >
                        <td>{film.id}</td>
                        <td>
                          <div className="poster-cell">
                            {film.affiche_url ? (
                              <img
                                src={film.affiche_url}
                                alt={film.titre}
                                className="poster-thumb"
                              />
                            ) : (
                              <div className="poster-placeholder">
                                {film.titre?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{film.titre}</td>
                        <td>{film.annee}</td>
                        <td>
                          {film.genre ? (
                            <span className="genre-badge">{film.genre}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="col-actions">
                          <button
                            className="btn btn-small"
                            onClick={() => handleEdit(film)}
                          >
                            Modifier
                          </button>
                          <Link
                            to={`/admin/films/${film.id}/casting`}
                            className="btn btn-small"
                            style={{ marginRight: 6, marginLeft: 6 }}
                          >
                            Casting
                          </Link>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDelete(film.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Petite info : combien affichés sur combien */}
              {filteredFilms.length > MAX_FILMS_DISPLAY && (
                <p className="admin-list-info">
                  Affichage des {MAX_FILMS_DISPLAY} premiers résultats sur{" "}
                  {filteredFilms.length}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
