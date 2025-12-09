// user-service/src/controllers/utilisateurController.js
const Utilisateur = require("../models/utilisateurModel");

const UtilisateurController = {

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "20", 10);
      const offset = (page - 1) * limit;

      const data = await Utilisateur.findAll(limit, offset);
      const total = await Utilisateur.countAll();

      res.json({ data, page, limit, total });
    } catch (e) {
      console.error("getAll error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  async getById(req, res) {
    try {
      const user = await Utilisateur.findById(req.params.id);
      if (!user)
        return res.status(404).json({ error: "Utilisateur introuvable" });
      res.json(user);
    } catch (e) {
      console.error("getById error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  async create(req, res) {
    try {
      const { nom, email, mot_de_passe, role } = req.body || {};
      if (!nom || !email) {
        return res.status(422).json({ error: "nom et email requis" });
      }

      const newUser = await Utilisateur.create({
        nom: nom.trim(),
        email: email.trim(),
        mot_de_passe: mot_de_passe || null,
        role: role || "user",
      });

      res.status(201).json(newUser);
    } catch (e) {
      if (e.message && e.message.includes("unique")) {
        return res.status(409).json({ error: "Email déjà utilisé" });
      }
      console.error("create error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  async update(req, res) {
    try {
      const updated = await Utilisateur.update(req.params.id, req.body);
      if (!updated) {
        return res
          .status(404)
          .json({ error: "Utilisateur introuvable ou aucun champ fourni" });
      }
      res.json(updated);
    } catch (e) {
      console.error("update error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  async remove(req, res) {
    try {
      const deleted = await Utilisateur.remove(req.params.id);
      if (!deleted)
        return res.status(404).json({ error: "Utilisateur introuvable" });
      res.status(204).send();
    } catch (e) {
      console.error("remove error:", e);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
};

module.exports = UtilisateurController;
