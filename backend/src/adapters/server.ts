import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { RoutesRepo } from "../outbound/postgres/routesRepo";
import routesController from "./routesController";

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

// Use routes controller
app.use("/", routesController);

// Export app for testing
export { app };

// Start server if this file is run directly
if (require.main === module) {
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.listen(PORT, () => {
    console.log(`FuelEU server is running on http://localhost:${PORT}`);
  });
}