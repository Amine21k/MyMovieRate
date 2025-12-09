// src/components/FilmRatingSection.jsx
export default function FilmRatingSection({
  user,
  note,
  setNote,
  myRating,
  onSubmitRating,
  moyenneGlobale,
  totalVotes,
}) {
  // Formatage de la moyenne globale
  const moyenne =
    moyenneGlobale !== null && !Number.isNaN(Number(moyenneGlobale))
      ? Number(moyenneGlobale).toFixed(1)
      : null;

  // Validation de la note saisie
  const noteNumber = Number(note);
  const isNoteValid =
    Number.isInteger(noteNumber) && noteNumber >= 1 && noteNumber <= 10;

  const hasRating = user && myRating !== null;
  

  return (
    <div className="section">
      <h3 className="section-title">Notes</h3>

      <div className="rating-section">
        {/* Bloc note moyenne */}
        <div className="rating-global-card">
          <div className="rating-circle">
            <span className="rating-circle-value">
              {moyenne !== null ? moyenne : "—"}
            </span>
            <span className="rating-circle-max">/10</span>
          </div>
          <div className="rating-global-info">
            <div className="rating-global-label">Note moyenne</div>
            <div className="rating-global-votes">
              {totalVotes > 0
                ? `${totalVotes} vote${totalVotes > 1 ? "s" : ""}`
                : "Pas encore de note"}
            </div>
          </div>
        </div>

        {/* Bloc note utilisateur */}
        <div className="rating-user-card">
          <div className="rating-user-header">
            <span className="rating-user-title">Votre note</span>

            {user && hasRating && (
              <span className="rating-user-current">
                Actuelle : <strong>{myRating}/10</strong>
              </span>
            )}
          </div>

          {user ? (
            <>
              {hasRating && (
                <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>
                  Vous pouvez modifier votre note à tout moment.
                </p>
              )}

              <form onSubmit={onSubmitRating}>
                <div className="form-group">
                  <label className="label">Choisissez une note (1–10)</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ex : 8"
                  />
                  {!isNoteValid && note !== "" && (
                    <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4 }}>
                      La note doit être un entier entre 1 et 10.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!isNoteValid}
                >
                  {hasRating ? "Mettre à jour ma note" : "Enregistrer ma note"}
                </button>
              </form>
            </>
          ) : (
            <p style={{ fontStyle: "italic", fontSize: 13 }}>
              Connectez-vous pour donner une note à ce film.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
