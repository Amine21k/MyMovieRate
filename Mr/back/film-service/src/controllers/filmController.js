const Film = require('../models/filmModel');

const FilmController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const offset = (page - 1) * limit;

      const data = await Film.findAll(limit, offset);
      const total = await Film.count();
      res.json({ data, page, limit, total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async getById(req, res) {
    try {
      const film = await Film.findById(req.params.id);
      if (!film) return res.status(404).json({ error: 'Film introuvable' });
      res.json(film);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async create(req, res) {
    try {
      const { titre, annee, genre, description, affiche_url, trailer_url } = req.body;
      if (!titre || !titre.trim()) return res.status(422).json({ error: 'titre requis' });
      const newFilm = await Film.create({ titre: titre.trim(), annee, genre, description, affiche_url, trailer_url });
      res.status(201).json(newFilm);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async update(req, res) {
    try {
      const updated = await Film.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Film introuvable ou aucun champ fourni' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async remove(req, res) {
    try {
      const deleted = await Film.remove(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Film introuvable' });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

module.exports = FilmController;
