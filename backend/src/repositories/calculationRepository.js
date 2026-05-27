//aqui é onde coloca os dados no banco e que puxa as informações

const db = require('../db/connection');

async function salvar({ userId, n1, n2, operador, resultado }) {
  const { rows } = await db.query(
    `INSERT INTO calculations (user_id, first_number, second_number, operator, result)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_number, second_number, operator, result, created_at`,
    [userId, n1, n2, operador, resultado]
  );
  return rows[0];
}

async function buscarPorUsuario(userId) {
  const { rows } = await db.query(
    `SELECT id, first_number, second_number, operator, result, created_at
     FROM calculations
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function deletarPorUsuario(userId) {
  await db.query('DELETE FROM calculations WHERE user_id = $1', [userId]);
}

module.exports = { salvar, buscarPorUsuario, deletarPorUsuario };