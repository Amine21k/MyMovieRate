const Acteur = require('./acteurModel');

const ActeurController = {
  async getAll(req, res) {
    try {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
      const offset = (page - 1) * limit;

      const data = await Acteur.findAll(limit, offset);
      const total = await Acteur.count();
      res.json({ data, page, limit, total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async getById(req, res) {
    try {
      const acteur = await Acteur.findById(req.params.id);
      if (!acteur) return res.status(404).json({ error: 'Acteur introuvable' });
      res.json(acteur);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async create(req, res) {
    try {
      const { nom, date_naissance, biographie, photo_url } = req.body || {};
      if (!nom || !nom.trim()) return res.status(422).json({ error: 'nom est requis' });

      const created = await Acteur.create({
        nom: nom.trim(),
        date_naissance: date_naissance ?? null,
        biographie: biographie ?? null,
        photo_url: photo_url ?? null
      });
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async update(req, res) {
    try {
      const updated = await Acteur.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Acteur introuvable ou aucun champ fourni' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async remove(req, res) {
    try {
      const deleted = await Acteur.remove(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Acteur introuvable' });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

module.exports = ActeurController;
