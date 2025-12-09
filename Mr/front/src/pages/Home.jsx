// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home({
  films = [],
  acteurs = [],
  search = "",
  onSearchChange = () => {},
  loading = false,
  error = "",
}) {
  const [randomFilms, setRandomFilms] = useState([]);
  const [randomActors, setRandomActors] = useState([]);

  const q = search.trim().toLowerCase();

  const filteredFilms = q
    ? films.filter((f) =>
        `${f.titre || ""} ${f.genre || ""} `
          .toLowerCase()
          .includes(q)
      )
    : films;

  const filteredActeurs = q
    ? acteurs.filter((a) =>
        `${a.nom || ""} `.toLowerCase().includes(q)
      )
    : acteurs;

  // 👉 Films aléatoires qui tournent
  useEffect(() => {
    const baseList = q ? filteredFilms : films;

    if (!baseList || baseList.length === 0) {
      setRandomFilms([]);
      return;
    }

    const updateRandomFilms = () => {
      const shuffled = [...baseList].sort(() => Math.random() - 0.5);
      setRandomFilms(shuffled.slice(0, 6));
    };

    updateRandomFilms();
    const intervalId = setInterval(updateRandomFilms, 5000);

    return () => clearInterval(intervalId);
  }, [films, q, filteredFilms.length]);

  // 👉 Acteurs aléatoires qui tournent aussi
  useEffect(() => {
    const baseList = q ? filteredActeurs : acteurs;

    if (!baseList || baseList.length === 0) {
      setRandomActors([]);
      return;
    }

    const updateRandomActors = () => {
      const shuffled = [...baseList].sort(() => Math.random() - 0.5);
      setRandomActors(shuffled.slice(0, 6));
    };

    updateRandomActors();
    const intervalId = setInterval(updateRandomActors, 5000);

    return () => clearInterval(intervalId);
  }, [acteurs, q, filteredActeurs.length]);

  return (
    <div className="container home-page">
      {/* HERO */}
      <div className="card home-hero-card">
        <div className="home-hero-left">
          <h1 className="home-title">Bienvenue sur MyMovieRate</h1>
          <p className="home-text">
            Explore les films, découvre les acteurs et consulte les notes
            et critiques de ta communauté.
          </p>

          <div className="home-stats-row">
            <div className="home-stat-pill">
              <span className="home-stat-label">Films</span>
              <span className="home-stat-value">{films.length}</span>
            </div>
            <div className="home-stat-pill">
              <span className="home-stat-label">Acteurs</span>
              <span className="home-stat-value">{acteurs.length}</span>
            </div>
          </div>
        </div>

        {/* Côté droit : barre de recherche */}
        <div className="home-hero-right">
          <label className="label">Recherche</label>

          <div className="home-search-wrapper">
            <span className="home-search-icon">🔍</span>
            <input
              className="input home-search-input"
              type="text"
              placeholder="Rechercher un film ou un acteur..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {q && (
            <p className="home-search-info">
              Résultats pour <span>« {search} »</span>
            </p>
          )}

          <div className="home-quick-links" style={{ marginTop: 12 }}>
            <Link to="/films" className="home-chip-link">
              Voir tous les films
            </Link>
           
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ color: "#f97373" }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <p>Chargement...</p>
        </div>
      ) : (
        <div className="home-grid">
          {/* FILMS */}
          <div className="card home-column">
            <div className="home-section-header">
              <h2 className="section-title">
                🎬 Films{" "}
                <span className="home-section-count">
                  ({filteredFilms.length})
                </span>
              </h2>
              <Link to="/films" className="home-section-link">
                Tous les films →
              </Link>
            </div>

            {randomFilms.length === 0 ? (
              <p style={{ opacity: 0.7 }}>Aucun film trouvé.</p>
            ) : (
              <div className="home-films-grid fade-rotate">
                {randomFilms.map((film) => (
                  <Link
                    key={film.id}
                    to={`/films/${film.id}`}
                    className="home-film-card"
                  >
                    <div className="home-film-poster-wrapper">
                      {film.affiche_url ? (
                        <img
                          src={film.affiche_url}
                          alt={film.titre}
                          className="home-film-poster"
                        />
                      ) : (
                        <div className="home-film-poster-fallback">
                          {film.titre?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="home-film-info">
                      <div className="home-film-title">{film.titre}</div>
                      <div className="home-film-meta">
                        {film.annee && <span>{film.annee}</span>}
                        {film.genre && (
                          <span className="home-chip">{film.genre}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ACTEURS */}
          <div className="card home-column">
            <div className="home-section-header">
              <h2 className="section-title">
                🎭 Acteurs{" "}
                <span className="home-section-count">
                  ({filteredActeurs.length})
                </span>
              </h2>
              
            </div>

            {randomActors.length === 0 ? (
              <p style={{ opacity: 0.7 }}>Aucun acteur trouvé.</p>
            ) : (
              <div className="home-films-grid fade-rotate">
                {randomActors.map((actor) => {
                  const birthYear = actor.date_naissance
                    ? new Date(actor.date_naissance).getFullYear()
                    : null;

                  return (
                    <Link
                      key={actor.id}
                      to={`/acteurs/${actor.id}`}
                      className="home-film-card"
                    >
                      <div className="home-film-poster-wrapper">
                        {actor.photo_url ? (
                          <img
                            src={actor.photo_url}
                            alt={actor.nom}
                            className="home-film-poster"
                          />
                        ) : (
                          <div className="home-film-poster-fallback">
                            {actor.nom?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="home-film-info">
                        <div className="home-film-title">{actor.nom}</div>
                        <div className="home-film-meta">
                          {birthYear && <span>{birthYear}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
