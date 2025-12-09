// auth-service/src/controllers/authController.js
const Utilisateur = require("../models/utilisateurModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const AuthController = {
  async register(req, res) {
    try {
      const { nom, email, mot_de_passe } = req.body;

      if (!nom || !email || !mot_de_passe) {
        return res.status(400).json({ message: "Champs manquants" });
      }

      // vérifier email déjà utilisé
      const existing = await Utilisateur.getByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email déjà utilisé" });
      }

      // hasher mdp
      const hash = await bcrypt.hash(mot_de_passe, 10);

      const user = await Utilisateur.create({
        nom,
        email,
        mot_de_passe: hash,
        role: "user",
      });

      return res.status(201).json({
        message: "Inscription réussie",
        user,
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },

  async login(req, res) {
    try {
      const { email, mot_de_passe } = req.body;

      if (!email || !mot_de_passe) {
        return res.status(400).json({ message: "Champs manquants" });
      }

      const user = await Utilisateur.getByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!isValid) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          nom: user.nom,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      delete user.mot_de_passe;

      return res.json({
        message: "Connexion réussie",
        user,
        token,
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },
};

module.exports = AuthController;
