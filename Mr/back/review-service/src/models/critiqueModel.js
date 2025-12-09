const pool = require("../../../shared/db");

const CritiqueModel = {
  async findByFilm(film_id) {
    const r = await pool.query(
      `SELECT c.id, c.commentaire, c.date_creation,
              u.id AS user_id, u.nom AS user_nom
       FROM critiques c
       JOIN utilisateurs u ON u.id = c.user_id
       WHERE c.film_id = $1
       ORDER BY c.date_creation DESC`,
      [film_id]
    );
    return r.rows;
  },

  // upsert : si l'utilisateur a déjà une critique pour ce film → UPDATE, sinon INSERT
  async upsertForFilm({ user_id, film_id, commentaire }) {
    const r = await pool.query(
      `INSERT INTO critiques (user_id, film_id, commentaire)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, film_id)
       DO UPDATE SET commentaire = EXCLUDED.commentaire,
                     date_creation = NOW()
       RETURNING id, user_id, film_id, commentaire, date_creation`,
      [user_id, film_id, commentaire]
    );
    return r.rows[0];
  },

  async removeByUserAndFilm({ user_id, film_id }) {
    const r = await pool.query(
      `DELETE FROM critiques
       WHERE user_id = $1 AND film_id = $2`,
      [user_id, film_id]
    );
    return r.rowCount; // 0 ou 1
  },


async findAll() {
  const r = await pool.query(
    `SELECT 
        c.id,
        c.commentaire,
        c.date_creation,
        c.film_id,
        f.titre AS film_titre,
        u.id AS user_id,
        u.nom AS user_nom
     FROM critiques c
     JOIN utilisateurs u ON u.id = c.user_id
     JOIN films f ON f.id = c.film_id
     ORDER BY c.date_creation DESC`
  );
  return r.rows;
},




  // suppression par ID (admin)
  async removeById(id) {
    const r = await pool.query(
      `DELETE FROM critiques WHERE id = $1`,
      [id]
    );
    return r.rowCount; // 0 ou 1
  },

};

module.exports = CritiqueModel;
