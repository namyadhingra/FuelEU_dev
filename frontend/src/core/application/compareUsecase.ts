// Directory: src/core/application/
// File: compareUsecase.ts
import { Route, ComparisonRow } from "../domain/types";

const TARGET_INTENSITY = 89.3368; // 2% below 91.16

/**
 * Calculate comparison metrics for a route
 * @param route - The route to analyze
 * @returns ComparisonRow with percentDiff and compliant flag
 */
export function calculateComparisonRow(route: Route): ComparisonRow {
  const percentDiff = ((route.ghgIntensity / 91.0) - 1) * 100;
  const compliant = route.ghgIntensity <= TARGET_INTENSITY;

  return {
    ...route,
    percentDiff,
    compliant,
  };
}

/**
 * Calculate compliance balance (CB)
 * Formula: CB = (target - actual) × (fuelConsumption × 41000)
 * @param target - Target GHG intensity
 * @param actual - Actual GHG intensity
 * @param fuelConsumptionT - Fuel consumption in tonnes
 * @returns Compliance balance in gCO2eq
 */
export function calculateComplianceBalance(
  target: number,
  actual: number,
  fuelConsumptionT: number
): number {
  const energyMJ = fuelConsumptionT * 41000;
  return (target - actual) * energyMJ;
}