// user-service/src/models/utilisateurModel.js
const pool = require("../../../shared/db");

const UtilisateurModel = {
  async findAll(limit = 20, offset = 0) {
    const r = await pool.query(
      "SELECT id, nom, email, role FROM utilisateurs ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return r.rows;
  },

  async countAll() {
    const r = await pool.query("SELECT COUNT(*) FROM utilisateurs");
    return parseInt(r.rows[0].count, 10);
  },

  async findById(id) {
    const r = await pool.query(
      "SELECT id, nom, email, role FROM utilisateurs WHERE id = $1",
      [id]
    );
    return r.rows[0];
  },

  async create({ nom, email, mot_de_passe = null, role = "user" }) {
    const r = await pool.query(
      `INSERT INTO utilisateurs (nom, email, mot_de_passe, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nom, email, role`,
      [nom, email, mot_de_passe, role]
    );
    return r.rows[0];
  },

  async update(id, fields) {
    const allowed = ["nom", "email", "mot_de_passe", "role"];
    const entries = Object.entries(fields || {}).filter(([k]) =>
      allowed.includes(k)
    );
    if (!entries.length) return null;

    const set = entries.map(([k], i) => `${k}=$${i + 1}`).join(", ");
    const values = entries.map(([, v]) => v);
    values.push(id);

    const r = await pool.query(
      `UPDATE utilisateurs
       SET ${set}
       WHERE id=$${values.length}
       RETURNING id, nom, email, role`,
      values
    );
    return r.rows[0];
  },

  async remove(id) {
    const r = await pool.query("DELETE FROM utilisateurs WHERE id=$1", [id]);
    return r.rowCount;
  },

  async getByEmail(email) {
    const r = await pool.query(
      "SELECT * FROM utilisateurs WHERE email = $1 LIMIT 1",
      [email]
    );
    return r.rows[0];
  },
};

module.exports = UtilisateurModel;
