// user-service/src/routes/me.js
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const pool = require("../../../shared/db");
const { requireAuth } = require("../../../shared/auth");

const TABLE_NAME = "utilisateurs";

/**
 * @swagger
 * tags:
 *   name: MonCompte
 *   description: Routes permettant à l’utilisateur connecté de gérer son propre compte
 */

// GET /me
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT id, nom, email, role 
       FROM ${TABLE_NAME} 
       WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur GET /me", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT /me
router.put("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, email } = req.body;

    if (!nom || !email) {
      return res
        .status(400)
        .json({ message: "Le nom et l’email sont obligatoires." });
    }

    const { rows } = await pool.query(
      `UPDATE ${TABLE_NAME}
       SET nom = $1,
           email = $2
       WHERE id = $3
       RETURNING id, nom, email, role`,
      [nom, email, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur PUT /me", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT /me/password
router.put("/password", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return res.status(400).json({
        message: "Les deux mots de passe sont requis.",
      });
    }

    const { rows } = await pool.query(
      `SELECT mot_de_passe 
       FROM ${TABLE_NAME} 
       WHERE id = $1`,
       [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const hashActuel = rows[0].mot_de_passe;

    const ok = await bcrypt.compare(ancienMotDePasse, hashActuel);
    if (!ok) {
      return res.status(403).json({
        message: "Ancien mot de passe incorrect.",
      });
    }

    const newHash = await bcrypt.hash(nouveauMotDePasse, 10);

    await pool.query(
      `UPDATE ${TABLE_NAME} 
       SET mot_de_passe = $1 
       WHERE id = $2`,
      [newHash, userId]
    );

    res.json({ message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur PUT /me/password", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
