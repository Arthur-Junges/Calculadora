# Calculadora:
###Projeto de calculadora online desenvolvida para a faculdade, com autenticação de usuario e operações de matematica.

## SOBRE:
A aplicação permite que o usuario realize operações basicas de matematica, como soma, subtração, divisão e multiplicação.
Além disso o sistema possui autenticação e histórico de calculos realizados.

Projeto é dividido em:
- Frontend: HTML, CSS e Javascript
- Backend: Node.js e Fastify
- Banco de dados: PostgresSQL
- Autenticação:JWT
- Segurança:Bcrypt

## Funcionalidades:
- Autenticação
- Login
- Histórico
- Calculos realizados no servidor
- Integração com banco de dados para salvar histórico (supabase)
- Interface simples

## Recursos usados:
- HTML
- CSS
- NODE
- FASTIFY
- POSTGRES
- JWT
- DOTENV
- NODEMON

## Estrutura:

```txt
Calculadora/
│
├── backend/
│   └── src/
│       ├── db/
│       ├── middlewares/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── server.js
│
├── css/
├── js/
├── index.html
├── autentication.html
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
  





