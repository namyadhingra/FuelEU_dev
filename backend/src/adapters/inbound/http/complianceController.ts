import { Router, Request, Response } from "express";
import { computeAndStoreCB } from "../../../core/application/computeComplianceUsecase";
import { ComplianceRepo } from "../../outbound/postgres/complianceRepo";
import { RoutesRepo } from "../../outbound/postgres/routesRepo";

const router = Router();
const routesRepo = new RoutesRepo();
const complianceRepo = new ComplianceRepo();

/**
 * GET /compliance/cb?routeId=:routeId&year=:year
 * Computes and stores carbon balance for a route, then returns the computed values.
 * 
 * @query routeId - Required route identifier
 * @query year - Required compliance year
 * @query target - Optional target GHG intensity (default: 89.3368)
 * @returns 200 - { cb, energy_mj, target, actual, routeId }
 * @returns 400 - { error: "Missing or invalid parameters" }
 * @returns 404 - { error: "Route not found" }
 * 
 * @example
 * GET /compliance/cb?routeId=R001&year=2024
 * Response: { cb: -349183200, energy_mj: 205000000, target: 89.3368, actual: 91.0, routeId: "R001" }
 */
router.get("/compliance/cb", async (req: Request, res: Response) => {
  try {
    const routeId = req.query.routeId as string;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : null;
    const target = req.query.target ? parseFloat(req.query.target as string) : undefined;

    if (!routeId) {
      res.status(400).json({ error: "Missing required parameter 'routeId'" });
      return;
    }

    if (!year || isNaN(year)) {
      res.status(400).json({ error: "Missing or invalid 'year' parameter" });
      return;
    }

    // Load route via routesRepo
    const route = await routesRepo.findById(routeId);
    if (!route) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    // Call computeAndStoreCB use-case with injected complianceRepo
    const params: {
      route: typeof route;
      year: number;
      target?: number;
    } = {
      route,
      year,
    };
    if (target !== undefined) {
      params.target = target;
    }

    const result = await computeAndStoreCB(params, {
      compliancePort: complianceRepo,
    });

    // Return JSON response with computed values
    res.status(200).json({
      cb: result.cb_gco2eq,
      energy_mj: result.energy_mj,
      target: result.target,
      actual: result.actual,
      routeId: route.routeId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error computing compliance CB:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
