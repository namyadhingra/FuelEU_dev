import { Route } from "../domain/Route";
import { ICompliancePort } from "../ports/compliancePort";

/**
 * Computes carbon balance (CB) and energy for a route and stores it as a compliance snapshot.
 * 
 * @param params - Parameters for computation
 * @param params.route - The route to compute compliance for
 * @param params.year - The compliance year
 * @param params.target - Optional target GHG intensity in gCO₂e/MJ (default: 89.3368)
 * @param ports - Port dependencies
 * @param ports.compliancePort - Compliance port for persistence
 * @returns Promise resolving to computed values
 */
export async function computeAndStoreCB(
  params: {
    route: Route;
    year: number;
    target?: number;
  },
  ports: { compliancePort: ICompliancePort }
): Promise<{
  cb_gco2eq: number;
  energy_mj: number;
  target: number;
  actual: number;
}> {
  const target = params.target ?? 89.3368;
  const actual = params.route.ghgIntensity;

  // Calculate energy in megajoules
  // Formula: energyMJ = fuelConsumptionT * 41000
  const energy_mj = params.route.fuelConsumptionT * 41000;

  // Calculate carbon balance
  // Formula: cb = (target - actual) * energyMJ
  const cb_gco2eq = (target - actual) * energy_mj;

  // Save snapshot to compliance port
  // Using routeId as shipId (as per requirement)
  await ports.compliancePort.saveSnapshot({
    shipId: params.route.routeId,
    routeId: params.route.routeId,
    year: params.year,
    cb_gco2eq,
    energy_mj,
    target_gco2eq_per_mj: target,
    actual_gco2eq_per_mj: actual,
  });

  return {
    cb_gco2eq,
    energy_mj,
    target,
    actual,
  };
}

