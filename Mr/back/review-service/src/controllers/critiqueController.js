const Critique = require("../models/critiqueModel");

const CritiqueController = {
  // GET /films/:id/critiques
  async listByFilm(req, res) {
    try {
      const filmId = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(filmId)) {
        return res.status(400).json({ error: "id film invalide" });
      }

      const data = await Critique.findByFilm(filmId);
      return res.json(data);
    } catch (e) {
      console.error("listByFilm error:", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // POST /films/:id/critiques  (création ou mise à jour de la critique de l'utilisateur connecté)
  async upsertForFilm(req, res) {
    try {
      const film_id = Number.parseInt(req.params.id, 10);
      const user_id = req.user?.id;              // 🔥 on récupère l'utilisateur via le token
      const { commentaire } = req.body || {};

      if (!Number.isInteger(film_id)) {
        return res.status(400).json({ error: "id film invalide" });
      }
      if (!Number.isInteger(user_id)) {
        return res.status(401).json({ error: "Authentification requise" });
      }

      // commentaire optionnel, mais on peut vérifier
      // if (!commentaire || commentaire.trim().length === 0) {
      //   return res.status(422).json({ error: "commentaire requis" });
      // }

      const row = await Critique.upsertForFilm({
        user_id,
        film_id,
        commentaire: commentaire || null,
      });

      return res.status(201).json(row);
    } catch (e) {
      if (e.message && e.message.toLowerCase().includes("foreign key")) {
        return res.status(404).json({ error: "Film ou utilisateur introuvable" });
      }
      console.error("upsertForFilm error:", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // DELETE /films/:id/critiques  (supprimer la critique de l'utilisateur connecté pour ce film)
  async deleteForFilm(req, res) {
    try {
      const film_id = Number.parseInt(req.params.id, 10);
      const user_id = req.user?.id;              // 🔥 idem : utilisateur connecté

      if (!Number.isInteger(film_id)) {
        return res.status(400).json({ error: "id film invalide" });
      }
      if (!Number.isInteger(user_id)) {
        return res.status(401).json({ error: "Authentification requise" });
      }

      const deleted = await Critique.removeByUserAndFilm({ user_id, film_id });
      if (!deleted) {
        return res.status(404).json({ error: "Critique introuvable" });
      }

      return res.status(204).send();
    } catch (e) {
      console.error("deleteForFilm error:", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },


  
  async adminList(req, res) {
    try {
      const data = await Critique.findAll();   // 👉 aucune logique compliquée ici
      return res.json(data);
    } catch (e) {
      console.error("adminList critiques error:", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },

  //  ADMIN : DELETE /admin/critiques/:critiqueId
  async adminDelete(req, res) {
    try {
      const critiqueId = Number.parseInt(req.params.critiqueId, 10);
      if (!Number.isInteger(critiqueId)) {
        return res.status(400).json({ error: "ID critique invalide" });
      }

      const deleted = await Critique.removeById(critiqueId);
      if (!deleted) {
        return res.status(404).json({ error: "Critique introuvable" });
      }

      return res.status(204).send();
    } catch (e) {
      console.error("adminDelete critique error:", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  },




};

module.exports = CritiqueController;
