// film-service/src/models/filmModel.js
const pool = require("../../../shared/db");

const FilmModel = {
  // Liste paginée des films
  async findAll(limit = 10, offset = 0) {
    const r = await pool.query(
      "SELECT * FROM films ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return r.rows;
  },

  // Nombre total de films
  async count() {
    const r = await pool.query("SELECT COUNT(*) FROM films");
    return parseInt(r.rows[0].count, 10);
  },

  // Récupérer un film par son ID
  async findById(id) {
    const r = await pool.query(
      "SELECT * FROM films WHERE id = $1",
      [id]
    );
    return r.rows[0];
  },

  // Créer un film
  async create({ titre, annee = null, genre = null, description = null, affiche_url = null, trailer_url = null }) {
    const r = await pool.query(
      `INSERT INTO films (titre, annee, genre, description, affiche_url, trailer_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [titre, annee, genre, description, affiche_url, trailer_url]
    );
    return r.rows[0];
  },

  // Mettre à jour partiellement un film
  async update(id, fields) {
    const allowed = ["titre", "annee", "genre", "description", "affiche_url", "trailer_url"];
    const entries = Object.entries(fields || {}).filter(([k]) =>
      allowed.includes(k)
    );
    if (!entries.length) return null; // rien à mettre à jour

    const set = entries.map(([k], i) => `${k} = $${i + 1}`).join(", ");
    const values = entries.map(([, v]) => v);
    values.push(id);

    const r = await pool.query(
      `UPDATE films
       SET ${set}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    return r.rows[0];
  },

  // Supprimer un film
  async remove(id) {
    const r = await pool.query(
      "DELETE FROM films WHERE id = $1",
      [id]
    );
    return r.rowCount; // 1 si supprimé, 0 si introuvable
  },
};

module.exports = FilmModel;
