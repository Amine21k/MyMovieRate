// actor-service/src/routes/acteurs.js
const express = require("express");
const ActeurController = require("../acteurController");
const { requireAuth, requireAdmin } = require("../../shared/auth");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Acteurs
 *   description: Gestion des acteurs (CRUD)
 */

router.get("/", ActeurController.getAll);

router.get("/:id", ActeurController.getById);

router.post("/", requireAuth, requireAdmin, ActeurController.create);

router.patch("/:id", requireAuth, requireAdmin, ActeurController.update);

router.delete("/:id", requireAuth, requireAdmin, ActeurController.remove);

module.exports = router;
