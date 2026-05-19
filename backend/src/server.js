require("dotenv").config();

const Fastify = require("fastify");
const cors = require("@fastify/cors");
const jwt = require("@fastify/jwt");

const authRoutes = require("./routes/authRoutes");
const calculationRoutes = require("./routes/calculationRoutes");

const app = Fastify({ logger: true });

app.register(cors, {
  origin: true
});

app.register(jwt, {
  secret: process.env.JWT_SECRET || "chave_padrao_dev"
});

app.get("/", async () => {
  return {
    status: "ok",
    message: "API da Calculadora Online funcionando!"
  };
});

app.get("/api/health", async () => {
  return {
    status: "ok",
    message: "Backend da calculadora funcionando."
  };
});

app.register(authRoutes, { prefix: "/api/auth" });
app.register(calculationRoutes, { prefix: "/api/calculations" });

const start = async () => {
  try {
    const port = process.env.PORT || 3000;

    await app.listen({
      port: Number(port),
      host: "0.0.0.0"
    });

    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();