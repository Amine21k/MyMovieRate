// actor-service/src/routes/casting.js
const express = require("express");
const router = express.Router();
const CastingController = require("../castingController");
const { requireAuth, requireAdmin } = require("../../shared/auth");

// Acteurs d’un film
router.get("/films/:filmId/acteurs", CastingController.listActorsByFilm);

// Films d’un acteur
router.get("/acteurs/:acteurId/films", CastingController.listFilmsByActor);

// Lier acteur → film (admin)
router.post(
  "/films/:filmId/acteurs",
  requireAuth,
  requireAdmin,
  CastingController.addActor
);

// Délier acteur → film (admin)
router.delete(
  "/films/:filmId/acteurs/:acteurId",
  requireAuth,
  requireAdmin,
  CastingController.removeActor
);

module.exports = router;
