const pool = require("../../../shared/db");

const RatingModel = {
  // Toutes les notes d'un film
  async findByFilm(film_id) {
    const r = await pool.query(
      `SELECT id, user_id, film_id, note, date_creation
       FROM ratings
       WHERE film_id = $1
       ORDER BY date_creation DESC`,
      [film_id]
    );
    return r.rows;
  },

  // Moyenne et total pour un film
  async getAverageForFilm(film_id) {
    const r = await pool.query(
      `SELECT 
          COALESCE(AVG(note), 0)::float AS moyenne,
          COUNT(*)::int            AS total
       FROM ratings
       WHERE film_id = $1`,
      [film_id]
    );
    return r.rows[0];       // { moyenne: 0.x, total: n }
  },

  // Upsert : 1 note par (user, film)
  async upsertForFilm({ user_id, film_id, note }) {
    const r = await pool.query(
      `INSERT INTO ratings (user_id, film_id, note)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, film_id)
       DO UPDATE SET note = EXCLUDED.note,
                     date_creation = NOW()
       RETURNING id, user_id, film_id, note, date_creation`,
      [user_id, film_id, note]
    );
    return r.rows[0];
  },

  // Supprimer la note d'un user pour un film
  async removeByUserAndFilm({ user_id, film_id }) {
    const r = await pool.query(
      `DELETE FROM ratings
       WHERE user_id = $1 AND film_id = $2`,
      [user_id, film_id]
    );
    return r.rowCount;   // 1 si supprimé, 0 sinon
  },
};

module.exports = RatingModel;
