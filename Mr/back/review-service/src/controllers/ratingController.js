const Rating = require("../models/ratingModel");

const RatingController = {
  // GET /films/:id/ratings
  async listByFilm(req, res) {
    try {
      const filmId = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(filmId)) {
        return res.status(400).json({ error: "id film invalide" });
      }

      const data = await Rating.findByFilm(filmId);
      const stats = await Rating.getAverageForFilm(filmId);

      return res.json({
        ratings: data,
        moyenne: stats?.moyenne ?? 0,
        total: stats ? Number(stats.total) : 0,
      });
    } catch (e) {
      console.error("listByFilm rating error:", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  async deleteForFilm(req, res) {
    try {
      const film_id = Number.parseInt(req.params.id, 10);
      const user_id = req.user.id;

      if (!Number.isInteger(film_id)) {
        return res.status(400).json({ error: "ID film invalide" });
      }

      const r = await Rating.removeByUserAndFilm({ film_id, user_id });

      if (r === 0) {
        return res.status(404).json({ error: "Note introuvable" });
      }

      return res.status(204).send();
    } catch (err) {
      console.error("delete rating error:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // POST /films/:id/ratings
  async upsertForFilm(req, res) {
    try {
      const film_id = Number.parseInt(req.params.id, 10);
      const user_id = req.user?.id;
      const { note } = req.body || {};

      if (!Number.isInteger(film_id)) {
        return res.status(400).json({ error: "id film invalide" });
      }
      if (!Number.isInteger(user_id)) {
        return res.status(401).json({ error: "Authentification requise" });
      }
      if (!Number.isInteger(note) || note < 1 || note > 10) {
        return res
          .status(422)
          .json({ error: "note doit être un entier entre 1 et 10" });
      }

      const rating = await Rating.upsertForFilm({ user_id, film_id, note });
      const stats = await Rating.getAverageForFilm(film_id);

      return res.status(201).json({
        rating,
        moyenne: stats?.moyenne ?? 0,
        total: stats ? Number(stats.total) : 0,
      });
    } catch (e) {
      if (e.message && e.message.toLowerCase().includes("foreign key")) {
        return res
          .status(404)
          .json({ error: "Film ou utilisateur introuvable" });
      }
      console.error("upsertForFilm rating error:", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },
};

module.exports = RatingController;
