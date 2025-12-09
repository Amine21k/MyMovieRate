const pool = require("../shared/db");

const CastingModel = {
  // acteurs d’un film
  async getActorsByFilm(filmId) {
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

  // films d’un acteur
  async getFilmsByActor(acteurId) {
    const r = await pool.query(
      `SELECT f.*
       FROM casting c
       JOIN films f ON f.id = c.film_id
       WHERE c.acteur_id = $1
       ORDER BY f.titre ASC`,
      [acteurId]
    );
    return r.rows;
  },

  // lier
  async addActorToFilm({ film_id, acteur_id }) {
    const r = await pool.query(
      `INSERT INTO casting (film_id, acteur_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING film_id, acteur_id`,
      [film_id, acteur_id]
    );
    return r.rows[0] || null; // null si déjà lié
  },

  // délier
  async removeActorFromFilm({ film_id, acteur_id }) {
    const r = await pool.query(
      `DELETE FROM casting WHERE film_id=$1 AND acteur_id=$2`,
      [film_id, acteur_id]
    );
    return r.rowCount; // 1 si supprimé, 0 sinon
  }
};

module.exports = CastingModel;
