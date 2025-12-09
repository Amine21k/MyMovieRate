const Casting = require('./castingModel');

const CastingController = {
  async listActorsByFilm(req, res) {
    const filmId = parseInt(req.params.filmId, 10);
    if (!Number.isInteger(filmId)) return res.status(400).json({ error: 'filmId invalide' });
    try {
      const data = await Casting.getActorsByFilm(filmId);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async listFilmsByActor(req, res) {
    const acteurId = parseInt(req.params.acteurId, 10);
    if (!Number.isInteger(acteurId)) return res.status(400).json({ error: 'acteurId invalide' });
    try {
      const data = await Casting.getFilmsByActor(acteurId);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async addActor(req, res) {
    const filmId = parseInt(req.params.filmId, 10);
    const { acteur_id } = req.body || {};
    if (!Number.isInteger(filmId)) return res.status(400).json({ error: 'filmId invalide' });
    if (!Number.isInteger(acteur_id)) return res.status(422).json({ error: 'acteur_id requis' });

    try {
      const row = await Casting.addActorToFilm({ film_id: filmId, acteur_id });
      if (!row) return res.status(200).json({ message: 'Déjà lié' });
      res.status(201).json(row);
    } catch (e) {
      if (e.message && e.message.toLowerCase().includes('foreign key')) {
        return res.status(404).json({ error: 'Film ou acteur introuvable' });
      }
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async removeActor(req, res) {
    const filmId = parseInt(req.params.filmId, 10);
    const acteurId = parseInt(req.params.acteurId, 10);
    if (!Number.isInteger(filmId) || !Number.isInteger(acteurId)) {
      return res.status(400).json({ error: 'IDs invalides' });
    }

    try {
      const deleted = await Casting.removeActorFromFilm({ film_id: filmId, acteur_id: acteurId });
      if (!deleted) return res.status(404).json({ error: 'Lien introuvable' });
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

module.exports = CastingController;
