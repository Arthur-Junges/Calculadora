//aqui fazemos a autenticação

async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: 'Token inválido ou expirado.' });
  }
}

module.exports = { authenticate };