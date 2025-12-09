// src/pages/FilmsList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../styles/FilmList.css";

export default function FilmsList() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Recherche + Tri (même logique que AdminFilms)
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("recent"); 
  // recent, titre_asc, titre_desc, annee_asc, annee_desc

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const res = await api.get("/films");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setFilms(list);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des films");
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  // ---- LOGIQUE RECHERCHE + TRI  ----
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
          // plus grand id = plus récent
          return (b.id || 0) - (a.id || 0);
      }
    });

    return sorted;
  };

  const filteredFilms = getFilteredAndSortedFilms();

  return (
    <div className="container">
      <h2 className="page-title">Tous les films</h2>
      <p className="page-subtitle">
        Recherchez et explorez le catalogue complet.
      </p>

      {/* Barre recherche + tri */}
      <div className="films-tools">
        <input
          type="text"
          className="films-search"
          placeholder="Rechercher un film (titre ou genre)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="films-sort"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="recent">📅 Plus récents</option>
          <option value="titre_asc">Titre A → Z</option>
          <option value="titre_desc">Titre Z → A</option>
          <option value="annee_desc">Année décroissante</option>
          <option value="annee_asc">Année croissante</option>
        </select>
      </div>

      {loading && (
        <div>
          <div className="loader" />
          <p>Chargement des films...</p>
        </div>
      )}

      {error && <p style={{ color: "#f97373" }}>{error}</p>}

      {!loading && !error && filteredFilms.length === 0 && (
        <p>Aucun film ne correspond à la recherche.</p>
      )}

      {!loading && !error && filteredFilms.length > 0 && (
        <div className="grid-films">
          {filteredFilms.map((film) => (
            <Link key={film.id} to={`/films/${film.id}`} className="film-card">
              {film.affiche_url ? (
                <img
                  src={film.affiche_url}
                  alt={film.titre}
                  className="film-poster"
                />
              ) : (
                <div className="film-poster-fallback" />
              )}

              <div className="film-card-body">
                <div className="film-title">
                  {film.titre} {film.annee ? `(${film.annee})` : ""}
                </div>
                <div className="film-meta">{film.genre || "—"}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
