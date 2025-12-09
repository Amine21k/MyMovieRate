// shared/db.js
const { Pool } = require("pg");
const path = require("path");

// ⬅ Charger le .env qui est dans le dossier shared
require("dotenv").config({
  path: path.resolve(__dirname, ".env"), // -> shared/.env
});

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD, // Amine (string)
  database: process.env.DB_NAME || "mymovierate",
});

// Test de connexion (optionnel)
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("❌ Erreur connexion DB:", err);
  else console.log("✅ Connexion OK à PostgreSQL →", res.rows[0]);
});

module.exports = pool;
