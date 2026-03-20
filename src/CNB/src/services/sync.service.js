// двигатель загрузки данных
// скачать → распарсить → отфильтровать → сохранить в БД

import axios from "axios";
import { config } from "../config/config.js";
import { CnbParser } from "../utils/parser.js";

export class SyncService {
  constructor(repository) {
    this.repository = repository;
  }

  // Synchronize today's rates
  async syncToday() {
    try {
      const today = new Date();
      // превращает дату в формат DD.MM.YYYY
      const dateString = CnbParser.formatDateForApi(today);

      console.log(`Syncing rates for ${dateString}`);
      const data = await this.fetchDailyRates(dateString);
      console.log("==== RAW DATA START ====");
      console.log(data);
      console.log("==== RAW DATA END ====");
      // парсинг - USA|dollar|1|USD|21.204 в объект: { currency: "USD", rate: 21.204 }
      const rates = CnbParser.parseDailyData(data, dateString);
      const filtered = CnbParser.filterByCurrencies(rates, config.currencies);
      // очистка - убираем дубликаты и пустые значения
      const cleaned = CnbParser.cleanRates(filtered);

      if (cleaned.length === 0) {
        console.log("No rates found for today");
        return { synced: 0, errors: ["No rates found"] };
      }

      const result = await this.repository.saveRates(cleaned);
      console.log(`Synced ${result.saved} rates for ${dateString}`);

      return result;
    } catch (error) {
      console.error("Error syncing today rates:", error.message);
      return { synced: 0, errors: [error.message] };
    }
  }

  // Synchronize rates for a specific date
  async syncByDate(date) {
    try {
      const dateString = CnbParser.formatDateForApi(date);

      console.log(`Syncing rates for ${dateString}`);

      const data = await this.fetchDailyRates(dateString);
      const rates = CnbParser.parseDailyData(data, dateString);
      const filtered = CnbParser.filterByCurrencies(rates, config.currencies);
      const cleaned = CnbParser.cleanRates(filtered);

      if (cleaned.length === 0) {
        console.log(`No rates found for ${dateString}`);
        return { synced: 0, errors: ["No rates found"] };
      }

      const result = await this.repository.saveRates(cleaned);
      console.log(`Synced ${result.saved} rates for ${dateString}`);

      return result;
    } catch (error) {
      console.error(`Error syncing rates for ${date}:`, error.message);
      return { synced: 0, errors: [error.message] };
    }
  }

  // Synchronize rates for a period
  async syncPeriod(startDate, endDate) {
    try {
      const { start, end } = CnbParser.validateDateRange(startDate, endDate);

      console.log(`Syncing rates from ${startDate} to ${endDate}`);

      let current = new Date(start);
      let totalSynced = 0;
      let totalErrors = [];
      // цикл по дням
      while (current <= end) {
        try {
          const result = await this.syncByDate(new Date(current));
          totalSynced += result.saved || 0;
          totalErrors.push(...result.errors);
        } catch (error) {
          const dateStr = CnbParser.formatDateForApi(current);
          console.log(`Skipping date ${dateStr} due to error:`, error.message);
          totalErrors.push(`Error on ${dateStr}: ${error.message}`);
        }

        current.setDate(current.getDate() + 1);
      }

      console.log(
        `Period sync completed. Total synced: ${totalSynced}, Total errors: ${totalErrors.length}`
      );

      return { synced: totalSynced, errors: totalErrors };
    } catch (error) {
      console.error("Error in period sync:", error.message);
      return { synced: 0, errors: [error.message] };
    }
  }

  // Synchronize historical data for a year
  async syncYear(year) {
    try {
      console.log(`Syncing historical data for year ${year}`);

      const data = await this.fetchYearlyRates(year);
      const rates = CnbParser.parseYearlyData(data, year);
      const filtered = CnbParser.filterByCurrencies(rates, config.currencies);
      const cleaned = CnbParser.cleanRates(filtered);

      if (cleaned.length === 0) {
        console.log(`No rates found for year ${year}`);
        return { synced: 0, errors: ["No rates found"] };
      }

      const result = await this.repository.saveRates(cleaned);
      console.log(`Synced ${result.saved} rates for year ${year}`);

      return result;
    } catch (error) {
      console.error(`Error syncing year ${year}:`, error.message);
      return { synced: 0, errors: [error.message] };
    }
  }

  // Fetch daily rates from ČNB API
  async fetchDailyRates(date) {
    const url = `${config.cnb.dailyUrl}?date=${date}`;
    return await this.fetchWithRetry(url);
  }

  // Fetch yearly rates from ČNB API
  async fetchYearlyRates(year) {
    const url = `${config.cnb.yearlyUrl}?year=${year}`;
    return await this.fetchWithRetry(url);
  }

  // Fetch data with retry logic
  async fetchWithRetry(url, attempt = 1) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "CNB-Rate-Sync/1.0",
        },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      if (attempt < config.retry.maxAttempts) {
        console.log(`Retry attempt ${attempt + 1} for ${url}`);
        await this.delay(config.retry.delayMs);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  // Delay helper
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get sync status
  async getSyncStatus() {
    try {
      const dateRange = await this.repository.getDateRange();
      const currencies = await this.repository.getAvailableCurrencies();

      return {
        dateRange,
        availableCurrencies: currencies,
        configuredCurrencies: config.currencies,
      };
    } catch (error) {
      console.error("Error getting sync status:", error.message);
      return { error: error.message };
    }
  }
}
