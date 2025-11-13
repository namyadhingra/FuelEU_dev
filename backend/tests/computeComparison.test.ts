import { computeComparison } from "../src/core/application/computeComparisonUsecase";
import { Route } from "../src/core/domain/Route";

/**
 * Unit tests for computeComparison use-case
 */
describe("computeComparison", () => {
  // Create fake baseline route
  const baselineRoute: Route = {
    routeId: "R001",
    vesselType: "Container",
    fuelType: "HFO",
    year: 2024,
    ghgIntensity: 91.0,
    fuelConsumptionT: 5000,
    distanceKm: 12000,
    totalEmissionsT: 4500,
    isBaseline: true,
  };

  // Create two other routes for comparison
  const route1: Route = {
    routeId: "R002",
    vesselType: "BulkCarrier",
    fuelType: "LNG",
    year: 2024,
    ghgIntensity: 88.0, // Lower than baseline (better)
    fuelConsumptionT: 4800,
    distanceKm: 11500,
    totalEmissionsT: 4200,
    isBaseline: false,
  };

  const route2: Route = {
    routeId: "R003",
    vesselType: "Tanker",
    fuelType: "MGO",
    year: 2024,
    ghgIntensity: 93.5, // Higher than baseline (worse)
    fuelConsumptionT: 5100,
    distanceKm: 12500,
    totalEmissionsT: 4700,
    isBaseline: false,
  };

  it("should calculate percentDiff correctly for routes better than baseline", () => {
    const target = 89.3368;
    const results = computeComparison(baselineRoute, [route1], target);

    expect(results).toHaveLength(1);
    expect(results[0].routeId).toBe("R002");
    expect(results[0].baselineValue).toBe(91.0);
    expect(results[0].comparisonValue).toBe(88.0);

    // percentDiff = ((88.0 / 91.0) - 1) * 100 = -3.2967...
    const expectedPercentDiff = ((88.0 / 91.0) - 1) * 100;
    expect(results[0].percentDiff).toBeCloseTo(expectedPercentDiff, 2);

    // 88.0 <= 89.3368, so compliant should be true
    expect(results[0].compliant).toBe(true);
  });

  it("should calculate percentDiff correctly for routes worse than baseline", () => {
    const target = 89.3368;
    const results = computeComparison(baselineRoute, [route2], target);

    expect(results).toHaveLength(1);
    expect(results[0].routeId).toBe("R003");
    expect(results[0].baselineValue).toBe(91.0);
    expect(results[0].comparisonValue).toBe(93.5);

    // percentDiff = ((93.5 / 91.0) - 1) * 100 = 2.7472...
    const expectedPercentDiff = ((93.5 / 91.0) - 1) * 100;
    expect(results[0].percentDiff).toBeCloseTo(expectedPercentDiff, 2);

    // 93.5 > 89.3368, so compliant should be false
    expect(results[0].compliant).toBe(false);
  });

  it("should handle multiple routes and calculate all comparisons", () => {
    const target = 89.3368;
    const results = computeComparison(baselineRoute, [route1, route2], target);

    expect(results).toHaveLength(2);

    // Check first route (R002 - better)
    const result1 = results.find((r) => r.routeId === "R002");
    expect(result1).toBeDefined();
    expect(result1?.percentDiff).toBeCloseTo(((88.0 / 91.0) - 1) * 100, 2);
    expect(result1?.compliant).toBe(true);

    // Check second route (R003 - worse)
    const result2 = results.find((r) => r.routeId === "R003");
    expect(result2).toBeDefined();
    expect(result2?.percentDiff).toBeCloseTo(((93.5 / 91.0) - 1) * 100, 2);
    expect(result2?.compliant).toBe(false);
  });

  it("should use custom target when provided", () => {
    const customTarget = 90.0;
    const results = computeComparison(baselineRoute, [route1, route2], customTarget);

    expect(results).toHaveLength(2);

    // R002: 88.0 <= 90.0, so compliant
    const result1 = results.find((r) => r.routeId === "R002");
    expect(result1?.compliant).toBe(true);

    // R003: 93.5 > 90.0, so not compliant
    const result2 = results.find((r) => r.routeId === "R003");
    expect(result2?.compliant).toBe(false);
  });

  it("should use default target (89.3368) when not provided", () => {
    const results = computeComparison(baselineRoute, [route1, route2]);

    expect(results).toHaveLength(2);

    // R002: 88.0 <= 89.3368, so compliant
    const result1 = results.find((r) => r.routeId === "R002");
    expect(result1?.compliant).toBe(true);

    // R003: 93.5 > 89.3368, so not compliant
    const result2 = results.find((r) => r.routeId === "R003");
    expect(result2?.compliant).toBe(false);
  });

  it("should handle route with exact target value", () => {
    const exactTargetRoute: Route = {
      routeId: "R004",
      vesselType: "RoRo",
      fuelType: "HFO",
      year: 2024,
      ghgIntensity: 89.3368, // Exactly at target
      fuelConsumptionT: 4900,
      distanceKm: 11800,
      totalEmissionsT: 4300,
      isBaseline: false,
    };

    const target = 89.3368;
    const results = computeComparison(baselineRoute, [exactTargetRoute], target);

    expect(results).toHaveLength(1);
    expect(results[0].routeId).toBe("R004");
    expect(results[0].comparisonValue).toBe(89.3368);
    expect(results[0].compliant).toBe(true); // <= target, so compliant
  });
});

