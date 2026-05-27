const authService = require('../services/authService');

async function authRoutes(app) {
  app.post('/register', async (request, reply) => {
    try {
      const user = await authService.registrar(request.body);
      return reply.status(201).send({ message: 'Usuário cadastrado com sucesso.', user });
    } catch (error) {
      return reply.status(error.status || 500).send({ message: error.message });
    }
  });

  app.post('/login', async (request, reply) => {
    try {
      const dados = await authService.login({ ...request.body, app });
      return reply.send({ message: 'Login realizado com sucesso.', ...dados });
    } catch (error) {
      return reply.status(error.status || 500).send({ message: error.message });
    }
  });
}

module.exports = authRoutes;