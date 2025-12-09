const pool = require("../shared/db");

const ActeurModel = {
  // Liste paginée des acteurs
  async findAll(limit = 10, offset = 0) {
    const r = await pool.query(
      "SELECT * FROM acteurs ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return r.rows;
  },

  // Nombre total d'acteurs
  async count() {
    const r = await pool.query("SELECT COUNT(*) FROM acteurs");
    return parseInt(r.rows[0].count, 10);
  },

  // Un acteur par ID
  async findById(id) {
    const r = await pool.query("SELECT * FROM acteurs WHERE id = $1", [id]);
    return r.rows[0]; // undefined si pas trouvé
  },

  // Créer un acteur
  async create({ nom, date_naissance = null, biographie = null, photo_url = null }) {
    const r = await pool.query(
      `INSERT INTO acteurs (nom, date_naissance, biographie, photo_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nom, date_naissance, biographie, photo_url]
    );
    return r.rows[0];
  },

  // Mettre à jour un acteur (champs partiels)
  async update(id, fields) {
    const allowed = ["nom", "date_naissance", "biographie", "photo_url"];
    const entries = Object.entries(fields || {}).filter(([k]) =>
      allowed.includes(k)
    );

    if (!entries.length) return null; // rien à mettre à jour

    const set = entries.map(([k], i) => `${k} = $${i + 1}`).join(", ");
    const values = entries.map(([, v]) => v);
    values.push(id);

    const r = await pool.query(
      `UPDATE acteurs
       SET ${set}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    return r.rows[0]; // null si pas trouvé
  },

  // Supprimer un acteur
  async remove(id) {
    const r = await pool.query("DELETE FROM acteurs WHERE id = $1", [id]);
    return r.rowCount; // 1 si supprimé, 0 sinon
  },

  // (Optionnel) Lister les acteurs d'un film donné
  async findByFilm(filmId) {
    const r = await pool.query(
      `SELECT a.*
       FROM casting c
       JOIN acteurs a ON a.id = c.acteur_id
       WHERE c.film_id = $1
       ORDER BY a.nom ASC`,
      [filmId]
    );
    return r.rows;
  },
};

module.exports = ActeurModel;
