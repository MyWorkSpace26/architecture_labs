//! взять данные из БД → посчитать статистику → вернуть результат

import { CnbParser } from "../utils/parser.js";

export class ReportService {
  constructor(repository) {
    this.repository = repository;
  }

  // Build exchange rate report for specified period and currencies
  async buildReport(startDate, endDate, currencies = null) {
    try {
      // Validate date range
      const { start, end } = CnbParser.validateDateRange(startDate, endDate);

      // Get rates from repository
      const rates = await this.repository.getRates(
        startDate,
        endDate,
        currencies
      );

      if (rates.length === 0) {
        return {
          period: { startDate, endDate },
          currencies: currencies || [],
          message: "No data found for the specified period and currencies",
          data: [],
        };
      }

      // Group rates by currency
      const groupedRates = this.groupRatesByCurrency(rates);

      // Calculate statistics for each currency
      const reportData = Object.keys(groupedRates).map((currency) => {
        const currencyRates = groupedRates[currency];
        const statistics = this.calculateStatistics(currencyRates);

        return {
          currency,
          ...statistics,
          dataPoints: currencyRates.length,
        };
      });

      return {
        period: { startDate, endDate },
        currencies: Object.keys(groupedRates),
        data: reportData,
      };
    } catch (error) {
      console.error("Error building report:", error.message);
      return {
        error: error.message,
        period: { startDate, endDate },
        currencies: currencies || [],
        data: [],
      };
    }
  }

  // Group rates by currency
  groupRatesByCurrency(rates) {
    const grouped = {};

    rates.forEach((rate) => {
      if (!grouped[rate.currency]) {
        grouped[rate.currency] = [];
      }
      grouped[rate.currency].push(rate.getRatePerUnit());
    });

    return grouped;
  }

  // Calculate statistics for rate array
  calculateStatistics(rates) {
    if (rates.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        median: 0, // середина списка
        variance: 0, // разброс значений
        stdDev: 0, // стандартное отклонение
      };
    }

    const sorted = [...rates].sort((a, b) => a - b);
    const sum = rates.reduce((acc, rate) => acc + rate, 0);
    const mean = sum / rates.length;

    // Basic statistics
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = mean;

    // Median
    const median = this.calculateMedian(sorted);

    // Variance and standard deviation
    const variance = this.calculateVariance(rates, mean);
    const stdDev = Math.sqrt(variance);

    return {
      min: this.roundToDecimals(min, 6),
      max: this.roundToDecimals(max, 6),
      avg: this.roundToDecimals(avg, 6),
      median: this.roundToDecimals(median, 6),
      variance: this.roundToDecimals(variance, 6),
      stdDev: this.roundToDecimals(stdDev, 6),
    };
  }

  // Calculate median
  calculateMedian(sortedRates) {
    const length = sortedRates.length;
    const middle = Math.floor(length / 2);

    if (length % 2 === 0) {
      return (sortedRates[middle - 1] + sortedRates[middle]) / 2;
    } else {
      return sortedRates[middle];
    }
  }

  // Calculate variance
  calculateVariance(rates, mean) {
    const squaredDiffs = rates.map((rate) => Math.pow(rate - mean, 2));
    const sumSquaredDiffs = squaredDiffs.reduce((acc, diff) => acc + diff, 0);
    return sumSquaredDiffs / rates.length;
  }

  // Round to specified decimal places
  roundToDecimals(value, decimals) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  // Get detailed report with daily rates
  async getDetailedReport(startDate, endDate, currencies = null) {
    try {
      const { start, end } = CnbParser.validateDateRange(startDate, endDate);

      const rates = await this.repository.getRates(
        startDate,
        endDate,
        currencies
      );

      if (rates.length === 0) {
        return {
          period: { startDate, endDate },
          currencies: currencies || [],
          message: "No data found",
          data: [],
        };
      }

      // Group by date and currency
      const groupedByDate = {};

      rates.forEach((rate) => {
        if (!groupedByDate[rate.date]) {
          groupedByDate[rate.date] = {};
        }
        groupedByDate[rate.date][rate.currency] = rate.getRatePerUnit();
      });

      // Convert to array format
      const dailyData = Object.keys(groupedByDate)
        .sort()
        .map((date) => ({
          date,
          rates: groupedByDate[date],
        }));

      return {
        period: { startDate, endDate },
        currencies: currencies || [],
        totalDays: dailyData.length,
        data: dailyData,
      };
    } catch (error) {
      console.error("Error getting detailed report:", error.message);
      return {
        error: error.message,
        period: { startDate, endDate },
        currencies: currencies || [],
        data: [],
      };
    }
  }

  // Get available currencies for reporting
  async getAvailableCurrencies() {
    try {
      return await this.repository.getAvailableCurrencies();
    } catch (error) {
      console.error("Error getting available currencies:", error.message);
      return [];
    }
  }

  // Get data availability info
  async getDataAvailability() {
    try {
      const dateRange = await this.repository.getDateRange();
      const currencies = await this.repository.getAvailableCurrencies();

      return {
        dateRange,
        availableCurrencies: currencies,
        totalCurrencies: currencies.length,
      };
    } catch (error) {
      console.error("Error getting data availability:", error.message);
      return {
        error: error.message,
        dateRange: null,
        availableCurrencies: [],
        totalCurrencies: 0,
      };
    }
  }
}
