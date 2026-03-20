//пришёл запрос → отправил в нужный сервис

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/config.js";
import { RateRepository } from "./repositories/rate.repository.js";
import { SyncService } from "./services/sync.service.js";
import { ReportService } from "./services/report.service.js";
import { ReportController } from "./controllers/report.controller.js";
import { SyncJob } from "./scheduler/sync.job.js";
import path from "path";

class CnbExchangeRateApp {
  constructor() {
    this.app = express();
    this.repository = null;
    this.syncService = null;
    this.reportService = null;
    this.controller = null;
    this.syncJob = null;
  }

  // Initialize application
  async initialize() {
    try {
      console.log("Initializing CNB Exchange Rate Application...");

      // Initialize database
      this.repository = new RateRepository(); //! создаётся SQLite + создаётся таблица rates
      await this.repository.initialize();

      // Initialize services
      this.syncService = new SyncService(this.repository); //! скачивает данные
      this.reportService = new ReportService(this.repository); //! предоставляет отчеты
      //! принимает HTTP-запросы
      this.controller = new ReportController(
        this.reportService,
        this.syncService
      );

      // Initialize scheduler
      this.syncJob = new SyncJob(this.syncService);

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Start scheduled sync job
      this.syncJob.start(); //! запускает задачу синхронизации

      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error.message);
      throw error;
    }
  }

  // Setup Express middleware
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  // Setup API routes
  setupRoutes() {
    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "CNB Exchange Rate Sync",
        version: "1.0.0",
      });
    });

    // API documentation endpoint
    this.app.get("/", (req, res) => {
      res.json({
        name: "CNB Exchange Rate API",
        version: "1.0.0",
        endpoints: {
          reports: {
            "GET /report": "Get exchange rate statistics",
            "GET /report/detailed": "Get detailed daily rates",
            "GET /report/currencies": "Get available currencies",
            "GET /report/availability": "Get data availability info",
          },
          sync: {
            "GET /sync/trigger": "Trigger manual sync for today",
            "GET /sync/period": "Sync data for specific period",
            "GET /sync/year": "Sync historical data for a year",
            "GET /sync/status": "Get sync status",
          },
        },
        examples: {
          report:
            "/report?startDate=01.01.2023&endDate=31.12.2023&currencies=USD,EUR,RUB",
          detailed:
            "/report/detailed?startDate=01.01.2023&endDate=07.01.2023&currencies=USD",
          syncPeriod: "/sync/period?startDate=01.01.2023&endDate=07.01.2023",
          syncYear: "/sync/year?year=2023",
        },
      });
    });

    // Report endpoints
    this.app.get("/report", (req, res) => this.controller.getReport(req, res));
    this.app.get("/report/detailed", (req, res) =>
      this.controller.getDetailedReport(req, res)
    );
    this.app.get("/report/currencies", (req, res) =>
      this.controller.getAvailableCurrencies(req, res)
    );
    this.app.get("/report/availability", (req, res) =>
      this.controller.getDataAvailability(req, res)
    );

    // Sync endpoints
    this.app.get("/sync/trigger", (req, res) =>
      this.controller.triggerSync(req, res)
    );
    this.app.get("/sync/period", (req, res) =>
      this.controller.syncPeriod(req, res)
    );
    this.app.get("/sync/year", (req, res) =>
      this.controller.syncYear(req, res)
    );
    this.app.get("/sync/status", (req, res) =>
      this.controller.getSyncStatus(req, res)
    );

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        error: "Endpoint not found",
        path: req.originalUrl,
        availableEndpoints: ["/health", "/", "/report", "/sync/trigger"],
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error("Unhandled error:", error);
      res.status(500).json({
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    });
  }

  // Start the server
  async start() {
    try {
      await this.initialize();

      this.server = this.app.listen(
        config.server.port,
        config.server.host,
        () => {
          console.log(
            `Server running on http://${config.server.host}:${config.server.port}`
          );
          console.log("API documentation available at: http://localhost:3001/");
          console.log(
            "Health check available at: http://localhost:3001/health"
          );
        }
      );

      // Graceful shutdown handling
      process.on("SIGTERM", () => this.shutdown());
      process.on("SIGINT", () => this.shutdown());
    } catch (error) {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    }
  }

  // Graceful shutdown
  async shutdown() {
    console.log("Shutting down gracefully...");

    if (this.syncJob) {
      this.syncJob.stop();
    }

    if (this.server) {
      this.server.close(() => {
        console.log("HTTP server closed");
      });
    }

    if (this.repository) {
      await this.repository.close();
    }

    console.log("Application shutdown complete");
    process.exit(0);
  }
}

// Start the application
const app = new CnbExchangeRateApp();
app.start().catch((error) => {
  console.error("Application startup failed:", error);
  process.exit(1);
});
