//aqui a gente ta colocando as funções de autenticação

const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const Senha_MAX = 72; //ignora alem de 72 bytes (não tem como derrubar o sistema com 1m de senha)

async function registrar({ name, email, password }) {
  //valida extras além do schema do Fastify
  if (!name || !email || !password) {
    throw Object.assign(new Error('Todos os campos são obrigatórios.'), { status: 400 });
  }

  //formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //linha do chat
  if (!emailRegex.test(email)) {
    throw Object.assign(new Error("Formato ta errado"), { status: 400 });
  }

  //tamanho da senha
  if (password.length < 6) {
    throw Object.assign(new Error('A senha deve ter pelo menos 6 caracteres.'), { status: 400 });
  }
  if (password.length > Senha_MAX){
    throw Object.assign(
      new Error(`A senha deve ter no maximo ${Senha_MAX} caracteres`),
      {status: 400}
    );
  }

  //ve se ja existe o email
  const existente = await userRepository.buscarPorEmail(email);
  if (existente) {
    throw Object.assign(new Error('Este email já está cadastrado.'), { status: 409 });
  }

  //hash da senha
  const hash = await bcrypt.hash(password, 10);
  return userRepository.criar({ name, email, hash });
}

async function login({ email, password, app }) {
  if (!email || !password) {
    throw Object.assign(new Error('Email e senha são obrigatórios.'), { status: 400 });
  }

  if (password.length > Senha_MAX) {
    throw Object.assign(new Error('Email ou senha inválidos.'), { status: 401 });
  }

  const user = await userRepository.buscarPorEmail(email.toLowerCase());
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