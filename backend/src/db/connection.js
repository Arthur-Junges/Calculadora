const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env')
});

if (!process.env.DATABASE_URL) {
  console.error('ERRO: DATABASE_URL não encontrada no .env');
  process.exit(1);
}

const isSupabase = process.env.DATABASE_URL.includes('supabase.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase
    ? {
        rejectUnauthorized: false
      }
    : false
});

module.exports = pool;