// src/pages/FilmDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

import FilmHeader from "../components/FilmHeader";
import FilmTrailer from "../components/FilmTrailer";
import FilmCast from "../components/FilmCast";

import FilmRatingSection from "../components/FilmRatingSection";
import FilmCritiquesSection from "../components/FilmCritiquesSection";

export default function FilmDetail() {
  const { id } = useParams();

  const [film, setFilm] = useState(null);
  const [ratingsInfo, setRatingsInfo] = useState({ moyenne: null, total: 0 });
  const [critiques, setCritiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [note, setNote] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [myRating, setMyRating] = useState(null);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // on charge tout en parallèle
        const [filmRes, ratingRes, critRes] = await Promise.all([
          api.get(`/films/${id}`),
          api.get(`/films/${id}/ratings`).catch((err) => {
            console.error("Erreur ratings:", err);
            return { data: { ratings: [], moyenne: null, total: 0 } };
          }),
          api.get(`/films/${id}/critiques`).catch((err) => {
            console.error("Erreur critiques:", err);
            return { data: [] };
          }),
        ]);

        setFilm(filmRes.data);

        // ratings
        const { ratings = [], moyenne = null, total = 0 } = ratingRes.data;
        setRatingsInfo({ moyenne, total });

        // note de l'utilisateur connecté
        if (user) {
          const mine = ratings.find((r) => r.user_id === user.id);
          if (mine) {
            setMyRating(mine.note);
            setNote(String(mine.note));
          } else {
            setMyRating(null);
            setNote("");
          }
        }

        // critiques
        setCritiques(critRes.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données du film.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // tu peux aussi mettre [id, user?.id] si tu veux être ultra clean

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vous devez être connecté pour donner une note.");
      return;
    }

    const value = Number(note);
    if (!Number.isInteger(value) || value < 1 || value > 10) {
      alert("Veuillez saisir une note entre 1 et 10.");
      return;
    }

    try {
      const res = await api.post(`/films/${id}/ratings`, { note: value });

      // backend renvoie moyenne & total à jour
      setRatingsInfo({
        moyenne: res.data.moyenne,
        total: res.data.total,
      });
      setMyRating(value);
      alert("Note enregistrée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’enregistrement de la note.");
    }
  };

  const handleCritiqueSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vous devez être connecté pour laisser une critique.");
      return;
    }

    try {
      await api.post(`/films/${id}/critiques`, { commentaire });
      const critRes = await api.get(`/films/${id}/critiques`);
      setCritiques(critRes.data);
      setCommentaire("");
      alert("Critique enregistrée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’enregistrement de la critique.");
    }
  };

  const handleDeleteCritique = async () => {
    if (!user) {
      alert("Vous devez être connecté.");
      return;
    }
    if (!window.confirm("Supprimer votre critique pour ce film ?")) {
      return;
    }

    try {
      await api.delete(`/films/${id}/critiques`);
      const critRes = await api.get(`/films/${id}/critiques`);
      setCritiques(critRes.data);
      alert("Critique supprimée.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la critique.");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loader" />
        <p style={{ textAlign: "center" }}>Chargement du film...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p style={{ color: "#f97373" }}>{error}</p>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="container">
        <p>Film introuvable.</p>
      </div>
    );
  }

  // utilisé par le header
  const moyenneAffiche =
    ratingsInfo.moyenne !== null &&
    !Number.isNaN(Number(ratingsInfo.moyenne))
      ? Number(ratingsInfo.moyenne).toFixed(2)
      : "Pas encore de note";

  return (
    <div className="container">
      <div className="card">
        {/* Fiche film */}
        <FilmHeader
          film={film}
          moyenneAffiche={moyenneAffiche}
          totalNotes={ratingsInfo.total}
        />

        {/* Section Notes */}
        <FilmRatingSection
          user={user}
          note={note}
          setNote={setNote}
          myRating={myRating}
          onSubmitRating={handleRatingSubmit}
          moyenneGlobale={ratingsInfo.moyenne}  // 🔥 IMPORTANT
          totalVotes={ratingsInfo.total}        // 🔥 IMPORTANT
        />
        <FilmTrailer trailerUrl={film.trailer_url} />
        <FilmCast filmId={id} />


        {/* Section Critiques */}
        <FilmCritiquesSection
          user={user}
          critiques={critiques}
          commentaire={commentaire}
          setCommentaire={setCommentaire}
          onSubmitCritique={handleCritiqueSubmit}
          onDeleteOwnCritique={handleDeleteCritique}
        />
      </div>
    </div>
  );
}
