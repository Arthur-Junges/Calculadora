/* Conexão com o Banco de Dados */

const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env')
});

if (!process.env.DATABASE_URL) {
  console.error('ERRO: DATABASE_URL não encontrada no .env');
  process.exit(1);
}

console.log('DATABASE_URL carregada:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Teste de conexão ao iniciar
pool.query('SELECT NOW()')
  .then((res) => {
    console.log('✅ Banco conectado com sucesso!');
    console.log('Horário do banco:', res.rows[0]);
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar no banco:');
    console.error(err);
  });

module.exports = pool;