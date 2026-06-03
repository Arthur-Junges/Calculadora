//rotas de autenticação 

const authService = require('../services/authService');
const rateLimit = require("@fastify/rate-limit");


//const code by Claude
const schemaRegistrar = {
  body: {
    type: "object",
    required: ["name", "email", "password"],
    additionalProperties: false,
    properties: {
      name:     { type: "string", minLength: 2,  maxLength: 80  },
      email:    { type: "string", format: "email", maxLength: 254 },
      password: { type: "string", minLength: 6,  maxLength: 72  },
    },
  },
};

const schemaLogin = {
  body: {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
      email:    { type: "string", format: "email", maxLength: 254 },
      password: { type: "string", minLength: 1,    maxLength: 72  },
    },
  },
};

//se der erro, na minha maquina tava funcionando

async function authRoutes(app) {
  //rateLimit mais restritivo para rotas de autenticação
  await AudioParam.register(rateLimit, {
    max: 10,
    timeWindow: "1 minute",
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: () => ({
      message: "Muitas tentativas, pera"
    }),
  });

  app.post("/register", { schema: schemaRegistrar }, async (request, reply) => {
    try {
      const user = await authService.registrar(request.body);
      return reply.status(201).send({ message: "Usuário cadastrado com sucesso.", user });
    } catch (error) {
      return reply.status(error.status || 500).send({ message: error.message });
    }
  });

  app.post("/login", { schema: schemaLogin }, async (request, reply) => {
    try {
      const dados = await authService.login({ ...request.body, app });
        // Define o JWT em cookie httponly — JavaScript do browser não consegue lê-lo
      reply.setCookie("token", dados.token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production", // HTTPS em prod
        sameSite: "strict",
        path:     "/",
        maxAge:   2 * 60 * 60,
      });
  
      // Não envia o token no corpo — só o usuário
      return reply.send({ message: "Login realizado com sucesso.", user: dados.user });
    } catch (error) {
      return reply.status(error.status || 500).send({ message: error.message });
    }
  });

  // Se sair, ele apaga o cookie no browser
  app.post("/logout", async (_request, reply) => {
    reply.clearCookie("token", { path: "/" });
    return reply.send({ message: "Logout realizado." });
  });
}

module.exports = authRoutes;