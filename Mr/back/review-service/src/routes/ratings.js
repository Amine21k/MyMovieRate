// review-service/src/routes/ratings.js
const express = require("express");
const router = express.Router();
const RatingController = require("../controllers/ratingController");
const { requireAuth } = require("../../../shared/auth");

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Gestion des notes des films
 */

// ... TON SWAGGER + TES ROUTES EXACTES ...

router.get("/:id/ratings", RatingController.listByFilm);

router.post("/:id/ratings", requireAuth, RatingController.upsertForFilm);

router.delete("/:id/ratings", requireAuth, RatingController.deleteForFilm);

module.exports = router;
