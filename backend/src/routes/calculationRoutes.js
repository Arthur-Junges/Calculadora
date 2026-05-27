const db = require("../db/connection");
const { authenticate } = require("../middlewares");


/* Processo de calcular, tirar a rota de junto com o o processo do banco */
function calculate(firstNumber, secondNumber, operator) {
  switch (operator) {
    case '+':
      return firstNumber + secondNumber;
    case '-':
      return firstNumber - secondNumber;
    case '*':
      return firstNumber * secondNumber;
    case '/':
      if (secondNumber === 0) throw new Error('Não é possível dividir por zero.');
      return firstNumber / secondNumber;
    case '^':
      return Math.pow(firstNumber, secondNumber);
    case 'sqrt':
      if (firstNumber < 0) throw new Error('Não é possível calcular raiz de número negativo.');
      return Math.sqrt(firstNumber);
    case 'log':
      if (firstNumber <= 0) throw new Error('Log indefinido para número menor ou igual a zero.');
      return Math.log10(firstNumber);
    default:
      throw new Error('Operador inválido.');
  }
}


/* Rotas do calculo */
async function calculationRoutes(app) {
  app.post('/', { preHandler: authenticate }, async (request, reply) => {
    const { firstNumber, secondNumber, operator } = request.body;
    const UNARIOS = ['sqrt', 'log'];

    if (firstNumber === undefined || !operator) {
      return reply.status(400).send({ message: 'Informe o número e o operador.' });
    }

    const n1 = Number(firstNumber);
    if (Number.isNaN(n1)) {
      return reply.status(400).send({ message: 'Os valores informados precisam ser números.' });
    }

    const n2 = UNARIOS.includes(operator) ? null : Number(secondNumber);
    if (!UNARIOS.includes(operator) && (secondNumber === undefined || Number.isNaN(n2))) {
      return reply.status(400).send({ message: 'Informe o segundo número.' });
    }

    try {
      const resultValue = calculate(n1, n2, operator);

      const saved = await db.query(
        `INSERT INTO calculations 
        (user_id, first_number, second_number, operator, result)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, first_number, second_number, operator, result, created_at`,
        [request.user.id, n1, n2, operator, resultValue]
      );

      return reply.status(201).send({
        message: 'Cálculo realizado com sucesso.',
        calculation: saved.rows[0]
      });
    } catch (error) {
      return reply.status(400).send({ message: error.message });
    }
  });

  app.get("/history", { preHandler: authenticate }, async (request, reply) => {
    const result = await db.query(
      `SELECT id, first_number, second_number, operator, result, created_at
       FROM calculations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [request.user.id]
    );

    return reply.send({
      history: result.rows
    });
  });

  app.delete("/history", { preHandler: authenticate }, async (request, reply) => {
    await db.query(
      "DELETE FROM calculations WHERE user_id = $1",
      [request.user.id]
    );

    return reply.send({
      message: "Histórico apagado com sucesso."
    });
  });
}

module.exports = calculationRoutes;

//mandar o joão dar um ALTER TABLE calculations ALTER COLUMN second_number DROP NOT NULL;