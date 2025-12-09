// src/pages/admin/AdminFilmCasting.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Select from "react-select"; // 🔹 nouveau
import api from "../../api";
import "../../styles/AdminFilmCasting.css";

export default function AdminFilmCasting() {
  const { id } = useParams(); // filmId dans l'URL

  const [film, setFilm] = useState(null);
  const [cast, setCast] = useState([]);        // acteurs du film
  const [acteurs, setActeurs] = useState([]);  // tous les acteurs

  const [selectedActeurId, setSelectedActeurId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // 1) Détails film
      const filmRes = await api.get(`/films/${id}`);
      const filmData = filmRes.data?.data || filmRes.data;
      setFilm(filmData || null);

      // 2) Casting du film
      const castRes = await api.get(`/films/${id}/acteurs`);
      const castList = Array.isArray(castRes.data?.data)
        ? castRes.data.data
        : Array.isArray(castRes.data)
        ? castRes.data
        : [];
      setCast(castList);

      // 3) Tous les acteurs (pour le select)
      const actorsRes = await api.get("/acteurs");
      const actorsList = Array.isArray(actorsRes.data?.data)
        ? actorsRes.data.data
        : [];
      setActeurs(actorsList);
    } catch (err) {
      console.error("Erreur chargement casting admin :", err);
      setError("Erreur lors du chargement du casting.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // acteurs disponibles = tous les acteurs - déjà dans le casting
  const availableActors = acteurs.filter(
    (a) => !cast.some((c) => c.id === a.id)
  );

  // options pour le select searchable
  const actorOptions = availableActors.map((a) => ({
    value: a.id,
    label: a.nom,
  }));

  const handleAddActor = async (e) => {
    e.preventDefault();
    if (!selectedActeurId) return;

    try {
      setError("");
      setMessage("");

      await api.post(`/films/${id}/acteurs`, {
        acteur_id: Number(selectedActeurId),
      });

      setMessage("Acteur ajouté au film.");
      setSelectedActeurId("");
      await loadData();
    } catch (err) {
      console.error("Erreur ajout acteur au film :", err);
      if (err.response?.status === 409) {
        setError("Cet acteur est déjà lié à ce film.");
      } else {
        setError("Erreur lors de l’ajout de l’acteur.");
      }
    }
  };

  const handleRemoveActor = async (acteurId, nom) => {
    if (!window.confirm(`Retirer ${nom} du casting de ce film ?`)) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/films/${id}/acteurs/${acteurId}`);

      setCast((prev) => prev.filter((a) => a.id !== acteurId));
      setMessage("Acteur retiré du casting.");
    } catch (err) {
      console.error("Erreur suppression acteur du film :", err);
      setError("Erreur lors de la suppression de l’acteur.");
    }
  };

  if (loading && !film) {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: 20 }}>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="container">
        <div className="card" style={{ marginTop: 20 }}>
          <p>Film introuvable.</p>
          <p>
            <Link to="/admin/films">← Retour à la liste des films</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-film-casting-page">
      {/* HEADER */}
      <div className="card admin-film-casting-header admin-card-elevated">
        <div className="admin-film-info">
          <h1 className="page-title">Casting du film</h1>
          <p className="admin-film-title">
            🎬 <strong>{film.titre}</strong>{" "}
            {film.annee && (
              <span className="admin-film-year">({film.annee})</span>
            )}
          </p>
          {film.genre && (
            <p className="admin-film-genre">
              <span>{film.genre}</span>
            </p>
          )}
        </div>
        <div className="admin-header-right">
          <Link to="/admin/films" className="btn btn-ghost">
            ← Retour films
          </Link>
          <Link to="/admin" className="btn btn-ghost">
            Dashboard
          </Link>
        </div>
      </div>

      {(error || message) && (
        <div className="card admin-messages admin-card-elevated">
          {error && <p className="msg-error">{error}</p>}
          {message && <p className="msg-success">{message}</p>}
        </div>
      )}

      <div className="admin-film-casting-content">
        {/* CASTING ACTUEL */}
        <div className="card admin-cast-card admin-card-elevated">
          <h2 className="admin-section-title">
            Acteurs de ce film ({cast.length})
          </h2>

          {loading ? (
            <p>Chargement...</p>
          ) : cast.length === 0 ? (
            <p>Aucun acteur lié à ce film pour le moment.</p>
          ) : (
            <div className="admin-cast-list">
              {cast.map((actor) => (
                <div key={actor.id} className="admin-cast-item">
                  <div className="admin-cast-left">
                    <div className="admin-cast-avatar">
                      {actor.photo_url ? (
                        <img
                          src={actor.photo_url}
                          alt={actor.nom}
                          className="admin-cast-avatar-img"
                        />
                      ) : (
                        <div className="admin-cast-avatar-fallback">
                          {actor.nom?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="admin-cast-text">
                      <div className="admin-cast-name">
                        <Link to={`/acteurs/${actor.id}`}>{actor.nom}</Link>
                      </div>
                      {actor.date_naissance && (
                        <div className="admin-cast-date">
                          Né(e) le{" "}
                          {new Date(
                            actor.date_naissance
                          ).toLocaleDateString("fr-FR")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="admin-cast-actions">
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleRemoveActor(actor.id, actor.nom)}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AJOUT D'UN ACTEUR */}
        <div className="card admin-add-actor-card admin-card-elevated">
          <h2 className="admin-section-title">Ajouter un acteur au casting</h2>
          <p className="admin-subtext">
            Sélectionne un acteur existant dans la base pour l’ajouter à ce
            film.
          </p>

          <form onSubmit={handleAddActor} className="admin-add-actor-form">
            <div className="form-group">
              <label className="label">Acteur</label>

              {/* 🔍 Select searchable dans UNE seule barre */}
              <Select
                classNamePrefix="cast-select"
                placeholder="Chercher un acteur par nom..."
                options={actorOptions}
                value={
                  selectedActeurId
                    ? actorOptions.find(
                        (opt) => opt.value === Number(selectedActeurId)
                      )
                    : null
                }
                onChange={(option) =>
                  setSelectedActeurId(option ? option.value : "")
                }
                isClearable
              />
            </div>

            {availableActors.length === 0 && (
              <p className="admin-subtext" style={{ marginTop: 8 }}>
                Tous les acteurs de la base sont déjà liés à ce film.
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedActeurId}
            >
              Ajouter au film
            </button>

            <p className="admin-subtext" style={{ marginTop: 12 }}>
              Besoin d’un nouvel acteur ?{" "}
              <Link to="/admin/acteurs">Crée-le dans "Gérer les acteurs"</Link>,
              puis reviens ici.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
