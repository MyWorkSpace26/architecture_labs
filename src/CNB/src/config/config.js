export const config = {
  // Database configuration
  database: {
    filename: "./data/rates.db",
  },

  // Synchronization schedule (cron format)
  // "0 1 * * *" = every day at 00:01
  syncTime: "0 1 * * *",

  // List of currencies to synchronize
  currencies: ["USD", "EUR", "RUB", "GBP", "CHF"],

  // Historical data start year
  startYear: 2019,

  // ČNB API endpoints
  cnb: {
    dailyUrl:
      "https://www.cnb.cz/en/financial_markets/foreign_exchange_market/exchange_rate_fixing/daily.txt",
    yearlyUrl:
      "https://www.cnb.cz/en/financial_markets/foreign_exchange_market/exchange_rate_fixing/year.txt",
  },

  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
  },

  // Retry configuration for API calls
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
  },
};
