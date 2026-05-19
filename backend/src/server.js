require('dotenv').config();

const fastify = require('fastify')({
  logger: true
});

const cors = require('@fastify/cors');

const authRoutes = require('./routes/authRoutes');
const calculoRoutes = require('./routes/calculationRoutes');

fastify.register(cors, {
  origin: '*'
});

// Rota inicial para testar se a API está funcionando
fastify.get('/', async () => {
  return {
    message: 'API da Calculadora Online funcionando!',
    status: 'ok'
  };
});

// Rotas do sistema
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(calculoRoutes, { prefix: '/calculos' });

const start = async () => {
  try {
    const port = process.env.PORT || 3000;

    await fastify.listen({
      port: Number(port),
      host: '0.0.0.0'
    });

    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();