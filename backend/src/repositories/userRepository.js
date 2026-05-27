//aqui a gente salva os dados do login e faz a busca do login

const db = require('../db/connection');

async function buscarPorEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function criar({ name, email, hash }) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name, email, hash]
  );
  return rows[0];
}

module.exports = { buscarPorEmail, criar };