import { computeCB } from "../domain/CBCalculator";
import { Route } from "../domain/Route";
import { Compliance } from "../domain/Compliance";
import { IRoutesRepo } from "../../adapters/outbound/postgres/routesRepo";
import { IComplianceRepo } from "../../adapters/outbound/postgres/complianceRepo";

/**
 * Use case for calculating and managing compliance
 */
export class ComplianceUseCase {
  constructor(
    private routesRepo: IRoutesRepo,
    private complianceRepo: IComplianceRepo
  ) {}

  /**
   * Calculates CB for a route and saves it
   * @param routeId - The route ID
   * @param year - The year
   * @param target - Target GHG intensity (default: 89.3368)
   * @returns The calculated compliance
   */
  async calculateAndSaveCB(routeId: string, year: number, target: number = 89.3368): Promise<Compliance> {
    const route = await this.routesRepo.findById(routeId);
    if (!route) {
      throw new Error(`Route with id '${routeId}' not found`);
    }

    // Calculate CB using the domain service
    const { cb, energyMJ } = computeCB(target, route.ghgIntensity, route.fuelConsumptionT);

    // Save compliance with all required fields
    const compliance: Compliance = {
      shipId: routeId,
      routeId: route.routeId,
      year,
      cbGco2eq: cb,
      energyMj: energyMJ,
      targetGco2eqPerMj: target,
      actualGco2eqPerMj: route.ghgIntensity,
    };

    return await this.complianceRepo.saveCompliance(compliance);
  }

  /**
   * Calculates CB for all routes in a year
   */
  async calculateCBForAllRoutes(year: number, target: number = 89.3368): Promise<Compliance[]> {
    const routes = await this.routesRepo.findAll();
    const compliances: Compliance[] = [];

    for (const route of routes) {
      if (route.year === year) {
        try {
          const compliance = await this.calculateAndSaveCB(route.routeId, year, target);
          compliances.push(compliance);
        } catch (error) {
          console.error(`Error calculating CB for route ${route.routeId}:`, error);
        }
      }
    }

    return compliances;
  }
}

