// src/components/FilmCritiquesSection.jsx
export default function FilmCritiquesSection({
  user,
  critiques,
  commentaire,
  setCommentaire,
  onSubmitCritique,
  onDeleteOwnCritique,   
}) {
  const nbCritiques = critiques.length;

  return (
    <div className="section">
      <div className="critique-header">
        <div>
          <h3 className="section-title" style={{ marginBottom: 2 }}>
            Critiques
          </h3>
          <span className="critique-count">
            {nbCritiques === 0
              ? "Aucune critique pour l’instant"
              : nbCritiques === 1
              ? "1 critique"
              : `${nbCritiques} critiques`}
          </span>
        </div>
      </div>

      {nbCritiques > 0 && (
        <div className="critique-list">
          {critiques.map((c) => {
            const isOwn = user && user.id === c.user_id;
            const dateStr = c.date_creation
              ? new Date(c.date_creation).toLocaleDateString()
              : "";

            const displayName = c.user_nom
              ? c.user_nom
              : `Utilisateur #${c.user_id}`;

            return (
              <div
                key={c.id}
                className={`critique-card ${isOwn ? "critique-own" : ""}`}
              >
                <div className="critique-avatar">
                  <span>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="critique-body">
                  <div className="critique-body-header">
                    <span className="critique-author">
                      {displayName}
                      {isOwn && <span className="critique-badge">Moi</span>}
                    </span>
                    <span className="critique-date">{dateStr}</span>
                  </div>

                  <p className="critique-text">
                    {c.commentaire && c.commentaire.trim().length > 0
                      ? c.commentaire
                      : "(aucun texte)"}
                  </p>

                  {isOwn && (
                    <button
                      type="button"
                      className="btn-critique-delete"
                      onClick={onDeleteOwnCritique}
                    >
                      Supprimer ma critique
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {nbCritiques === 0 && (
        <p style={{ marginTop: 10, opacity: 0.9 }}>
          Soyez le premier à partager votre avis sur ce film.
        </p>
      )}

      {user ? (
        <form
          onSubmit={onSubmitCritique}
          style={{ marginTop: 18, maxWidth: 520 }}
        >
          <div className="form-group">
            <label className="label">Votre critique</label>
            <textarea
              className="textarea"
              rows={4}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Qu’avez-vous pensé de ce film ?"
            />
          </div>
          <button type="submit" className="btn-primary">
            Publier la critique
          </button>
        </form>
      ) : (
        <p style={{ fontStyle: "italic", marginTop: 12 }}>
          Connectez-vous pour laisser une critique.
        </p>
      )}
    </div>
  );
}
