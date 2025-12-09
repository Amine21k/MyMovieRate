// auth-service/src/routes/auth.js
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification (login / register)
 */

// POST /auth/register
router.post("/register", AuthController.register);

// POST /auth/login
router.post("/login", AuthController.login);

module.exports = router;
