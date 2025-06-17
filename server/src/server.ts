import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import flashcardRoutes from "./routes/flashcards";

/**
 * Express server for the Flashcard application
 */
class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  private initializeMiddleware(): void {
    // Enable CORS for all routes
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:4200",
        credentials: true,
      }),
    );

    // Parse JSON bodies
    this.app.use(bodyParser.json({ limit: "10mb" }));

    // Parse URL-encoded bodies
    this.app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging middleware
    this.app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      },
    );
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get("/health", (req: express.Request, res: express.Response) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // API routes
    this.app.use("/api/flashcards", flashcardRoutes);

    // Default route
    this.app.get("/", (req: express.Request, res: express.Response) => {
      res.json({
        message: "Flashcard API Server",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          flashcards: "/api/flashcards",
        },
      });
    });

    // 404 handler for unmatched routes
    this.app.use("*", (req: express.Request, res: express.Response) => {
      res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
      });
    });
  }

  /**
   * Initialize error handling middleware
   */
  private initializeErrorHandling(): void {
    this.app.use(
      (
        error: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        console.error("Unhandled error:", error);
        res.status(500).json({
          error: "Internal server error",
          message:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Something went wrong",
        });
      },
    );
  }

  /**
   * Start the server
   */
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
      console.log(
        `Flashcard API available at http://localhost:${this.port}/api/flashcards`,
      );
      console.log(
        `Health check available at http://localhost:${this.port}/health`,
      );
    });
  }

  /**
   * Get the Express application instance
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start();
}

export default Server;
