// calculationRoutes.js

const { authenticate }        = require("../middlewares/auth");
const calculationService      = require("../services/calculationService");
const calculationRepository   = require("../repositories/calculationRepository");

const OPERADORES_VALIDOS = ["+", "-", "*", "/", "^", "sqrt","nroot"];

// Schema de validação para o endpoint de cálculo
const schemaCalculo = {
  body: {
    type: "object",
    required: ["firstNumber", "operator"],
    additionalProperties: false,
    properties: {
      firstNumber:  { type: "number" },
      secondNumber: { type: "number" },
      operator: {
        type: "string",
        enum: OPERADORES_VALIDOS,
      },
    },
  },
};

async function calculationRoutes(app) {
  app.post(
    "/",
    { preHandler: authenticate, schema: schemaCalculo },
    async (request, reply) => {
      try {
        const { n1, n2, resultado } = calculationService.validarECalcular(request.body);
        const calculo = await calculationRepository.salvar({
          userId: request.user.id,
          n1,
          n2,
          operador: request.body.operator,
          resultado,
        });
        return reply.status(201).send({ message: "Cálculo realizado.", calculation: calculo });
      } catch (error) {
        return reply.status(error.status || 400).send({ message: error.message });
      }
    }
  );

  app.get("/history", { preHandler: authenticate }, async (request, reply) => {
    const history = await calculationRepository.buscarPorUsuario(request.user.id);
    return reply.send({ history });
  });

  app.delete("/history", { preHandler: authenticate }, async (request, reply) => {
    await calculationRepository.deletarPorUsuario(request.user.id);
    return reply.send({ message: "Histórico apagado." });
  });

  app.get("/ranking", { preHandler: authenticate }, async (request, reply) => {
  const ranking = await calculationRepository.rankingPorUsuario(request.user.id);
  return reply.send({ ranking });
  });
}

module.exports = calculationRoutes;
