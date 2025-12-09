// src/components/FilmCast.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function FilmCast({ filmId }) {
  const [cast, setCast] = useState([]);

  useEffect(() => {
    const fetchCast = async () => {
      try {
        const res = await api.get(`/films/${filmId}/acteurs`);
        setCast(res.data);
      } catch (err) {
        console.error("Erreur acteurs :", err);
      }
    };

    fetchCast();
  }, [filmId]);

  // Calcul de l'âge
  const getAge = (birth) => {
    if (!birth) return null;
    const d = new Date(birth);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  };

  return (
    <div className="section">
      <h3 className="section-title">Acteurs</h3>

      {cast.length === 0 ? (
        <p style={{ opacity: 0.8 }}>Aucun acteur enregistré pour ce film.</p>
      ) : (
        <div className="cast-grid">
          {cast.map((actor) => {
            const nom = actor.nom;
            const photo = actor.photo_url;
            const naissance = actor.date_naissance;
            const bio = actor.biographie;
            const age = getAge(naissance);

            return (
              <Link
                key={actor.id}
                to={`/acteurs/${actor.id}`}
                className="cast-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="cast-avatar-wrapper">
                  {photo ? (
                    <img src={photo} alt={nom} className="cast-avatar-img" />
                  ) : (
                    <div className="cast-avatar-fallback">
                      {nom.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="cast-text">
                  <div className="cast-name">{nom}</div>

                  {naissance && (
                    <div className="cast-date">
                      Né(e) le{" "}
                      {new Date(naissance).toLocaleDateString("fr-FR")}{" "}
                      {age !== null && <span>({age} ans)</span>}
                    </div>
                  )}

                  {bio && (
                    <div className="cast-bio">
                      {bio.length > 100 ? bio.substring(0, 100) + "..." : bio}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
