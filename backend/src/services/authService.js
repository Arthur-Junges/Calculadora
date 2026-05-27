//aqui a gente ta colocando as funções de autenticação

const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

async function registrar({ name, email, password }) {
  if (!name || !email || !password) {
    throw Object.assign(new Error('Todos os campos são obrigatórios.'), { status: 400 });
  }
  if (password.length < 6) {
    throw Object.assign(new Error('A senha deve ter pelo menos 6 caracteres.'), { status: 400 });
  }

  const existente = await userRepository.buscarPorEmail(email);
  if (existente) {
    throw Object.assign(new Error('Este email já está cadastrado.'), { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  return userRepository.criar({ name, email, hash });
}

async function login({ email, password, app }) {
  if (!email || !password) {
    throw Object.assign(new Error('Email e senha são obrigatórios.'), { status: 400 });
  }

  const user = await userRepository.buscarPorEmail(email);
  if (!user) {
    throw Object.assign(new Error('Email ou senha inválidos.'), { status: 401 });
  }

  const senhaValida = await bcrypt.compare(password, user.password_hash);
  if (!senhaValida) {
    throw Object.assign(new Error('Email ou senha inválidos.'), { status: 401 });
  }

  const token = app.jwt.sign({ id: user.id, name: user.name, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

module.exports = { registrar, login };