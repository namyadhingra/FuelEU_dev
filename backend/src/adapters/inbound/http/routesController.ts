import { Router, Request, Response } from "express";
import { RoutesRepo } from "../../outbound/postgres/routesRepo";

const router = Router();
const routesRepo = new RoutesRepo();

/**
 * POST /routes/:id/baseline
 * Sets a specific route as the baseline for compliance calculations.
 * 
 * @param req.params.id - The route_id to set as baseline
 * @returns 200 - { message: "Baseline updated" } on success
 * @returns 404 - { error: "Route not found" } if route does not exist
 * @returns 500 - { error: "error message" } on server error
 * 
 * @example
 * POST /routes/R001/baseline
 * Response: { message: "Baseline updated" }
 */
router.post("/routes/:id/baseline", async (req: Request, res: Response) => {
  try {
    const routeId = req.params.id;
    if (!routeId) {
      res.status(400).json({ error: "Route ID is required" });
      return;
    }

    await routesRepo.setBaseline(routeId);
    res.status(200).json({ message: "Baseline updated" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (errorMessage.includes("not found")) {
      res.status(404).json({ error: "Route not found" });
    } else {
      console.error("Error setting baseline:", errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  }
});

export default router;