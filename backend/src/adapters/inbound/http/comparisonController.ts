import { Router, Request, Response } from "express";
import { CompareRoutesUseCase } from "../../../core/application/CompareRoutesUseCase";
import { RoutesRepo } from "../../outbound/postgres/routesRepo";

const router = Router();
const routesRepo = new RoutesRepo();
const compareUseCase = new CompareRoutesUseCase(routesRepo);

/**
 * GET /routes/comparison
 * Compares all routes against the baseline route.
 * 
 * @query target - Optional target GHG intensity (default: 89.3368)
 * @returns 200 - { baseline: Route, comparisons: RouteComparison[] }
 * @returns 404 - { error: "Baseline not found" } if no baseline is set
 * 
 * @example
 * GET /routes/comparison?target=89.3368
 * Response: {
 *   baseline: { routeId: "R001", ... },
 *   comparisons: [
 *     { routeId: "R002", percentDifference: -3.3, compliant: true, ... }
 *   ]
 * }
 */
router.get("/routes/comparison", async (req: Request, res: Response) => {
  try {
    const target = req.query.target ? parseFloat(req.query.target as string) : 89.3368;

    if (isNaN(target)) {
      res.status(400).json({ error: "Invalid target value" });
      return;
    }

    const result = await compareUseCase.execute(target);

    if (!result.baseline) {
      res.status(404).json({ error: "Baseline not found. Please set a baseline route first." });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error comparing routes:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;

