const { PrismaClient } = require("@prisma/client");
//логирование запросов Prisma для отладки и анализа SQL
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

module.exports = prisma;
