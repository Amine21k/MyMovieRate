// src/pages/ActorDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";


export default function ActorDetail() {
  const { id } = useParams();

  const [actor, setActor] = useState(null);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAge = (birth) => {
    if (!birth) return null;
    const d = new Date(birth);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const actorRes = await api.get(`/acteurs/${id}`);
        setActor(actorRes.data);

        const filmsRes = await api.get(`/acteurs/${id}/films`);
        setFilms(filmsRes.data);
      } catch (err) {
        console.error("Erreur ActorDetail :", err);
        setError("Impossible de charger les données de l'acteur.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="page"><p>Chargement…</p></div>;
  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!actor) return <div className="page"><p>Acteur introuvable.</p></div>;

  const age = getAge(actor.date_naissance);

  return (
    <div className="page actor-detail-page">

      {/* Header acteur */}
      <div className="actor-header">

        <div className="actor-photo-wrapper">
          {actor.photo_url ? (
            <img
              src={actor.photo_url}
              alt={actor.nom}
              className="actor-photo-img"
            />
          ) : (
            <div className="actor-photo-fallback">
              {actor.nom?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="actor-header-text">
          <h1 className="actor-name">{actor.nom}</h1>

          {actor.date_naissance && (
            <p className="actor-birth">
              Né(e) le{" "}
              {new Date(actor.date_naissance).toLocaleDateString("fr-FR")}{" "}
              {age !== null && <span>– {age} ans</span>}
            </p>
          )}

          {actor.biographie && (
            <p className="actor-bio">
              {actor.biographie}
            </p>
          )}
        </div>
      </div>

      {/* Liste des films */}
      <div className="actor-films-section">
        <h2>Films avec {actor.nom}</h2>

        {films.length === 0 ? (
          <p className="no-films">Aucun film enregistré pour cet acteur.</p>
        ) : (
          <div className="actor-films-grid">
            {films.map((film) => (
              <Link
                key={film.id}
                to={`/films/${film.id}`}
                className="actor-film-card"
              >
                <div className="actor-film-poster-wrapper">
                  {film.affiche_url ? (
                    <img
                      src={film.affiche_url}
                      alt={film.titre}
                      className="actor-film-poster"
                    />
                  ) : (
                    <div className="actor-film-poster-fallback">
                      {film.titre.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="actor-film-info">
                  <div className="actor-film-title">{film.titre}</div>
                  {film.annee && <div className="actor-film-year">{film.annee}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
