//принять HTTP запрос → вызвать сервис → вернуть JSON
//браузер → controller → service → база → обратно

//! Controller - менеджер запросов:
// ❌ не парсит
// ❌ не считает
// ❌ не работает с БД
// 👉 он просто передаёт управление дальше

export class ReportController {
  constructor(reportService, syncService) {
    this.reportService = reportService;
    this.syncService = syncService;
  }

  // Get exchange rate report - СЦЕНАРИЙ 3
  async getReport(req, res) {
    try {
      const { startDate, endDate, currencies } = req.query;

      // Validate required parameters
      if (!startDate || !endDate) {
        return res.status(400).json({
          error:
            "Missing required parameters: startDate and endDate are required",
          example:
            "/report?startDate=01.01.2023&endDate=31.12.2023&currencies=USD,EUR",
        });
      }

      // Parse currencies parameter - Преобразование валют "USD,EUR" → ["USD", "EUR"]
      const currencyList = currencies
        ? currencies.split(",").map((c) => c.trim().toUpperCase())
        : null;

      // Generate report
      const report = await this.reportService.buildReport(
        startDate,
        endDate,
        currencyList
      );

      res.json({
        success: true,
        ...report,
      });
    } catch (error) {
      console.error("Report controller error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  // Get detailed daily rates
  async getDetailedReport(req, res) {
    try {
      const { startDate, endDate, currencies } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error:
            "Missing required parameters: startDate and endDate are required",
        });
      }

      const currencyList = currencies
        ? currencies.split(",").map((c) => c.trim().toUpperCase())
        : null;
      const report = await this.reportService.getDetailedReport(
        startDate,
        endDate,
        currencyList
      );

      res.json({
        success: true,
        ...report,
      });
    } catch (error) {
      console.error("Detailed report controller error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  // Get available currencies
  async getAvailableCurrencies(req, res) {
    try {
      const currencies = await this.reportService.getAvailableCurrencies();

      res.json({
        success: true,
        currencies,
      });
    } catch (error) {
      console.error("Available currencies controller error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  // Get data availability info
  async getDataAvailability(req, res) {
    try {
      const availability = await this.reportService.getDataAvailability();

      res.json({
        success: true,
        ...availability,
      });
    } catch (error) {
      console.error("Data availability controller error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  // Manual sync trigger - СЦЕНАРИЙ 1
  async triggerSync(req, res) {
    try {
      const result = await this.syncService.syncToday();

      res.json({
        success: true,
        message: "Manual sync completed",
        result,
      });
    } catch (error) {
      console.error("Manual sync controller error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  // Sync for specific period - СЦЕНАРИЙ 2
  async syncPeriod(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error:
            "Missing required parameters: startDate and endDate are required",
        });
      }

      const result = await this.syncService.syncPeriod(startDate, endDate);

      res.json({
        success: true,
        message: `Period sync from ${startDate} to ${endDate} completed`,
        result,
      });
    } catch (error) {
      console.error("Period sync controller error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  // Sync historical data for a year
  async syncYear(req, res) {
    try {
      const { year } = req.query;

      if (!year) {
        return res.status(400).json({
          error: "Missing required parameter: year is required",
        });
      }

      const yearNum = parseInt(year);
      if (
        isNaN(yearNum) ||
        yearNum < 1990 ||
        yearNum > new Date().getFullYear()
      ) {
        return res.status(400).json({
          error:
            "Invalid year. Please provide a valid year between 1990 and current year",
        });
      }

      const result = await this.syncService.syncYear(yearNum);

      res.json({
        success: true,
        message: `Year ${yearNum} sync completed`,
        result,
      });
    } catch (error) {
      console.error("Year sync controller error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  // Get sync status
  async getSyncStatus(req, res) {
    try {
      const status = await this.syncService.getSyncStatus();

      res.json({
        success: true,
        status,
      });
    } catch (error) {
      console.error("Sync status controller error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
}
