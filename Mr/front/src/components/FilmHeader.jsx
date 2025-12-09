// src/components/FilmHeader.jsx
export default function FilmHeader({ film, moyenneAffiche, totalNotes }) {
  return (
    <div className="film-detail-hero">
      {/* Affiche */}
      <div className="film-detail-poster">
        {film.affiche_url ? (
          <img src={film.affiche_url} alt={film.titre} />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#020b16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            Pas d’affiche
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="film-detail-info">
        <h2 className="page-title">
          {film.titre} {film.annee && <span>({film.annee})</span>}
        </h2>
        <p className="page-subtitle">{film.genre || "—"}</p>

        <div style={{ marginTop: 12 }}>
          <strong>Résumé :</strong>
          <p style={{ marginTop: 6 }}>
            {film.description || "Aucune description."}
          </p>
        </div>
      </div>
    </div>
  );
}
