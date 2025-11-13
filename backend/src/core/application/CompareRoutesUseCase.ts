import { Route } from "../domain/Route";
import { RouteComparison } from "../domain/Compliance";
import { IRoutesRepo } from "../../adapters/outbound/postgres/routesRepo";

/**
 * Use case for comparing routes against baseline
 */
export class CompareRoutesUseCase {
  constructor(private routesRepo: IRoutesRepo) {}

  /**
   * Compares all routes against the baseline
   * @param target - Target GHG intensity (default: 89.3368 gCO₂e/MJ)
   * @returns Array of route comparisons
   */
  async execute(target: number = 89.3368): Promise<{
    baseline: Route | null;
    comparisons: RouteComparison[];
  }> {
    const baseline = await this.routesRepo.findBaseline();
    if (!baseline) {
      return {
        baseline: null,
        comparisons: [],
      };
    }

    const allRoutes = await this.routesRepo.findAll();
    const comparisons: RouteComparison[] = [];

    for (const route of allRoutes) {
      // Skip baseline itself
      if (route.routeId === baseline.routeId) {
        continue;
      }

      // Calculate percent difference
      const percentDifference = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;

      // Check compliance: route must be <= target
      const compliant = route.ghgIntensity <= target;

      comparisons.push({
        routeId: route.routeId,
        vesselType: route.vesselType,
        fuelType: route.fuelType,
        year: route.year,
        ghgIntensity: route.ghgIntensity,
        percentDifference,
        compliant,
      });
    }

    return {
      baseline,
      comparisons,
    };
  }
}

