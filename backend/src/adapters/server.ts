import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { RoutesRepo } from "./outbound/postgres/routesRepo";
import routesController from "./inbound/http/routesController";
import comparisonController from "./inbound/http/comparisonController";
import complianceController from "./inbound/http/complianceController";
import bankingController from "./inbound/http/bankingController";
import poolsController from "./inbound/http/poolsController";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
const routesRepo = new RoutesRepo();

/**
 * GET /routes
 * Fetches all routes from the database and returns them as JSON.
 * 
 * @example
 * GET /routes
 * Response: [
 *   {
 *     id: 1,
 *     routeId: "R001",
 *     vesselType: "Container",
 *     ...
 *   }
 * ]
 */
app.get("/routes", async (req: Request, res: Response) => {
  try {
    const routes = await routesRepo.findAll();
    res.status(200).json(routes);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error fetching routes:", errorMessage);
    res.status(500).json({ error: "Failed to fetch routes", details: errorMessage });
  }
});

/**
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// Use controllers
app.use("/", routesController);
app.use("/", comparisonController);
app.use("/compliance", complianceController);
app.use("/banking", bankingController);
app.use("/", poolsController);

// Export app for testing
export { app };

// Start server if this file is run directly
if (require.main === module) {
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.listen(PORT, () => {
    console.log(`FuelEU server is running on http://localhost:${PORT}`);
  });
}