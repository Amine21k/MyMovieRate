// film-service/src/routes/films.js
const express = require("express");
const FilmController = require("../controllers/filmController");
const { requireAuth, requireAdmin } = require("../../../shared/auth");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Films
 *   description: Endpoints pour la gestion des films
 */

router.get("/", FilmController.getAll);

router.get("/:id", FilmController.getById);

router.post("/", requireAuth, requireAdmin, FilmController.create);

router.patch("/:id", requireAuth, requireAdmin, FilmController.update);

router.delete("/:id", requireAuth, requireAdmin, FilmController.remove);

module.exports = router;
