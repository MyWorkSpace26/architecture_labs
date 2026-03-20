import { ExchangeRate } from "../models/rate.model.js";

export class CnbParser {
  // Parse daily rates data from ČNB
  static parseDailyData(data, date) {
    if (!data || typeof data !== "string") {
      throw new Error("Invalid data format");
    }

    const lines = data
      .split("\n")
      .map((line) => line.replace(/\r/g, "").trim())
      .filter(Boolean);

    const rates = [];

    for (const line of lines) {
      // пропускаем заголовки
      if (
        line.includes("Country") ||
        line.includes("Rate") ||
        line.includes("Mar") || // дата строка
        line.includes("#") ||
        line.length < 10
      ) {
        continue;
      }

      const rate = this.parseLine(line);

      if (rate && rate.isValid()) {
        rate.date = date;
        rates.push(rate);
      }
    }

    console.log(`Parsed ${rates.length} rates for ${date}`);
    return rates;
  }

  // Универсальный парсинг строки ČNB
  static parseLine(line) {
    try {
      line = line.replace(/\r/g, "").trim();

      const parts = line
        .split("|")
        .map((p) => p.trim())
        .filter(Boolean);

      // ВАЖНО: >= 5 вместо === 5
      if (parts.length < 5) {
        return null;
      }

      const amount = parseInt(parts[2]);
      const currency = parts[3];

      const rateStr = parts[4].replace(",", ".").replace(/\s/g, "").trim();
      const rate = parseFloat(rateStr);

      if (!currency || isNaN(amount) || isNaN(rate)) {
        return null;
      }

      return new ExchangeRate(null, currency, rate, amount);
    } catch (error) {
      console.error("Error parsing line:", line);
      return null;
    }
  }

  // Parse yearly rates data from ČNB
  static parseYearlyData(data, year) {
    if (!data || typeof data !== "string") {
      throw new Error("Invalid data format");
    }

    const lines = data.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      throw new Error("Empty data received");
    }

    const dateLineIndex = lines.findIndex((line) => line.includes("Date"));

    if (dateLineIndex === -1) {
      throw new Error("Date header not found");
    }

    const rates = [];

    for (let i = dateLineIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split("|");

      if (parts.length < 2) continue;

      const date = parts[0].trim();

      if (!date.match(/^\d{2}\.\d{2}\.\d{4}$/)) continue;

      for (let j = 1; j < parts.length; j++) {
        const rate = this.parseLine(parts[j]);

        if (rate && rate.isValid()) {
          rate.date = date;
          rates.push(rate);
        }
      }
    }

    console.log(`Parsed ${rates.length} yearly rates for ${year}`);

    return rates;
  }

  // Filter rates by configured currencies
  static filterByCurrencies(rates, currencies) {
    if (!currencies || currencies.length === 0) {
      return rates;
    }

    console.log("Currencies from config:", currencies);
    console.log(
      "Parsed currencies:",
      rates.map((r) => r.currency)
    );

    return rates.filter((rate) => currencies.includes(rate.currency));
  }

  // Remove duplicates and validate rates
  static cleanRates(rates) {
    const seen = new Set();
    const cleaned = [];

    for (const rate of rates) {
      const key = `${rate.date}-${rate.currency}`;

      if (!seen.has(key) && rate.isValid()) {
        seen.add(key);
        cleaned.push(rate);
      }
    }

    return cleaned;
  }

  // Format date for ČNB API (DD.MM.YYYY)
  static formatDateForApi(date) {
    if (date instanceof Date) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    }

    return date;
  }

  // Parse date from string (DD.MM.YYYY)
  static parseDate(dateString) {
    if (!dateString) return null;

    const parts = dateString.split(".");
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    return new Date(year, month - 1, day);
  }

  // Validate date range
  static validateDateRange(startDate, endDate) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    if (!start || !end) {
      throw new Error("Invalid date format. Use DD.MM.YYYY");
    }

    if (start > end) {
      throw new Error("Start date must be before end date");
    }

    return { start, end };
  }
}
