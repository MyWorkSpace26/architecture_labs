import sqlite3 from "sqlite3";
import { config } from "../config/config.js";
import { ExchangeRate } from "../models/rate.model.js";
import path from "path";

export class RateRepository {
  constructor() {
    this.dbPath = path.resolve(config.database.filename);
    this.db = null;
  }

  // Initialize database connection and create table
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error("Database connection error:", err);
          reject(err);
          return;
        }
        console.log("Connected to SQLite database");
        this.createTable().then(resolve).catch(reject);
      });
    });
  }

  // Create rates table if not exists
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        currency TEXT NOT NULL,
        rate REAL NOT NULL,
        amount INTEGER NOT NULL DEFAULT 1,
        UNIQUE(date, currency)
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table creation error:", err);
          reject(err);
        } else {
          console.log("Rates table ready");
          resolve();
        }
      });
    });
  }

  // Save or update exchange rates
  async saveRates(rates) {
    if (!rates || rates.length === 0) return { saved: 0, errors: [] };

    const sql = `
      INSERT OR REPLACE INTO rates (date, currency, rate, amount)
      VALUES (?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      let completed = 0;
      let errors = [];
      let saved = 0;

      rates.forEach((rate) => {
        const dbObj = rate.toDbObject();

        this.db.run(
          sql,
          [dbObj.date, dbObj.currency, dbObj.rate, dbObj.amount],
          (err) => {
            if (err) {
              errors.push(
                `Error saving ${rate.currency} on ${rate.date}: ${err.message}`
              );
            } else {
              saved++;
            }

            completed++;
            if (completed === rates.length) {
              if (errors.length > 0) {
                console.error("Some rates failed to save:", errors);
              }
              resolve({ saved, errors });
            }
          }
        );
      });
    });
  }

  // Get rates for specific period and currencies
  async getRates(startDate, endDate, currencies = null) {
    let sql = `
      SELECT date, currency, rate, amount
      FROM rates
      WHERE date >= ? AND date <= ?
    `;
    const params = [startDate, endDate];

    if (currencies && currencies.length > 0) {
      sql += ` AND currency IN (${currencies.map(() => "?").join(",")})`;
      params.push(...currencies);
    }

    sql += " ORDER BY date, currency";

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const rates = rows.map((row) => ExchangeRate.fromDbRow(row));
          resolve(rates);
        }
      });
    });
  }

  // Check if rate exists for specific date and currency
  async rateExists(date, currency) {
    const sql = "SELECT 1 FROM rates WHERE date = ? AND currency = ? LIMIT 1";

    return new Promise((resolve, reject) => {
      this.db.get(sql, [date, currency], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  // Get available currencies
  async getAvailableCurrencies() {
    const sql = "SELECT DISTINCT currency FROM rates ORDER BY currency";

    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map((row) => row.currency));
        }
      });
    });
  }

  // Get date range of available data
  async getDateRange() {
    const sql =
      "SELECT MIN(date) as min_date, MAX(date) as max_date FROM rates";

    return new Promise((resolve, reject) => {
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Close database connection
  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error("Error closing database:", err);
          } else {
            console.log("Database connection closed");
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
