const bcrypt = require('bcryptjs');
const db = require('../db/connection');


async function authRoutes(app) {
    app.post('/register', async (request, reply) => {
        const { name, email, password } = request.body;

    if (!name || !email || !password) {
            return reply.status(400).send({ message: 'Todos os campos são obrigatórios' });
      
    }

    if (password.length < 6) {
        return reply.status(400).send({ message: 'A senha deve conter pelo menos 6 caracteres' });
    }

    const userExists = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return reply.status(409).send({
        message: "Este email já está cadastrado."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );
    return reply.status(201).send({
      message: "Usuário cadastrado com sucesso.",
      user: result.rows[0]
    });
  });

  app.post("/login", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({
        message: "Email e senha são obrigatórios."
      });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return reply.status(401).send({
        message: "Email ou senha inválidos."
      });
    }

    const user = result.rows[0];

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordIsValid) {
      return reply.status(401).send({
        message: "Email ou senha inválidos."
      });
    }

    const token = app.jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email
    });

    return reply.send({
      message: "Login realizado com sucesso.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
}

module.exports = authRoutes;