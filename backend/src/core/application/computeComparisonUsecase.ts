import { Route } from "../domain/Route";

/**
 * Comparison result for a route compared against baseline
 */
export type ComparisonResult = {
  routeId: string;
  baselineValue: number;
  comparisonValue: number;
  percentDiff: number;
  compliant: boolean;
};

/**
 * Computes comparison between baseline route and other routes.
 * 
 * @param baseline - The baseline route to compare against
 * @param others - Array of other routes to compare
 * @param target - Optional target GHG intensity in gCO₂e/MJ (default: 89.3368)
 * @returns Array of comparison results
 */
export function computeComparison(
  baseline: Route,
  others: Route[],
  target?: number
): ComparisonResult[] {
  const targetValue = target ?? 89.3368;
  const baselineValue = baseline.ghgIntensity;

  return others.map((route) => {
    const comparisonValue = route.ghgIntensity;

    // Calculate percent difference
    // Formula: percentDiff = ((comparison / baseline) - 1) * 100
    const percentDiff = ((comparisonValue / baselineValue) - 1) * 100;

    // Determine compliance
    // compliant = comparison <= target
    const compliant = comparisonValue <= targetValue;

    return {
      routeId: route.routeId,
      baselineValue,
      comparisonValue,
      percentDiff,
      compliant,
    };
  });
}

