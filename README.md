# Calculadora
Projeto de calculadora da faculdade




dentro da server.ks (explicação bem por cima)
// são rotas, muitas rotas puxando da api, 
// e cada rota tem um prefixo, tipo:
// /api/auth, /api/calculations
// E cada rota tem um arquivo separado, tipo authRoutes.js, calculationRoutes.js
// Arquivos de rota tem as rotas relacionadas a ele, tipo authRoutes.js tem as rotas de login e cadastro, calculationRoutes.js tem as rotas de cálculo e histórico
// Cada rota tem um handler que é a função que vai ser executada quando a rota for chamada. 
// O handler tem acesso ao request e reply do Fastify, pode usar o db para acessar o banco de dados, e pode usar o app.jwt para gerar ou verificar tokens JWT
