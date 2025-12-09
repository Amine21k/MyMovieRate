// review-service/src/routes/critiques.js
const express = require("express");
const CritiqueController = require("../controllers/critiqueController");
const { requireAuth, requireAdmin } = require("../../../shared/auth");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Critiques
 *   description: Gestion des critiques (commentaires) des films
 */

// ... TON SWAGGER + TES ROUTES EXACTES ...

router.get("/:id/critiques", CritiqueController.listByFilm);

router.post("/:id/critiques", requireAuth, CritiqueController.upsertForFilm);

router.delete("/:id/critiques", requireAuth, CritiqueController.deleteForFilm);

router.get(
  "/critiques",
  requireAuth,
  requireAdmin,
  CritiqueController.adminList
);

router.delete(
  "/critiques/:critiqueId",
  requireAuth,
  requireAdmin,
  CritiqueController.adminDelete
);

module.exports = router;
