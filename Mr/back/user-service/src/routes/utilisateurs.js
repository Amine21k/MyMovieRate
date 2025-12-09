// user-service/src/routes/utilisateurs.js
const express = require("express");
const router = express.Router();
const utilisateurController = require("../controllers/utilisateurController");
const { requireAuth, requireAdmin } = require("../../../shared/auth");

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs (admin)
 */

router.get("/", requireAuth, requireAdmin, utilisateurController.getAll);

router.get("/:id", requireAuth, requireAdmin, utilisateurController.getById);

router.post("/", requireAuth, requireAdmin, utilisateurController.create);

router.patch("/:id", requireAuth, requireAdmin, utilisateurController.update);

router.delete("/:id", requireAuth, requireAdmin, utilisateurController.remove);

module.exports = router;
