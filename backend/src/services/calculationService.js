//aqui ta os serviços do calculo que vai fazer

const OPERADORES_UNARIOS = ['sqrt', 'log'];

function calcular(n1, n2, operador) {
  switch (operador) {
    case '+': return n1 + n2;
    case '-': return n1 - n2;
    case '*': return n1 * n2;
    case '/':
      if (n2 === 0) throw new Error('Não é possível dividir por zero.');
      return n1 / n2;
    case '^': return Math.pow(n1, n2);
    case 'sqrt':
      if (n1 < 0) throw new Error('Raiz de número negativo é indefinida.');
      return Math.sqrt(n1);
    default:
      throw new Error('Operador inválido.');
  }
}

function validarECalcular({ firstNumber, secondNumber, operator }) {
  if (firstNumber === undefined || !operator) {
    throw Object.assign(new Error('Informe o número e o operador.'), { status: 400 });
  }

  const n1 = Number(firstNumber);
  if (Number.isNaN(n1)) {
    throw Object.assign(new Error('O primeiro valor precisa ser um número.'), { status: 400 });
  }

  const ehUnario = OPERADORES_UNARIOS.includes(operator);
  const n2 = ehUnario ? null : Number(secondNumber);

  if (!ehUnario && (secondNumber === undefined || Number.isNaN(n2))) {
    throw Object.assign(new Error('Informe o segundo número.'), { status: 400 });
  }

  const resultado = calcular(n1, n2, operator);
  return { n1, n2, resultado };
}

module.exports = { validarECalcular };