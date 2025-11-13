import { computeAndStoreCB } from "../src/core/application/computeComplianceUsecase";
import { Route } from "../src/core/domain/Route";
import { ICompliancePort } from "../src/core/ports/compliancePort";

/**
 * Unit tests for computeAndStoreCB use-case
 */
describe("computeAndStoreCB", () => {
  // Create a sample route
  const sampleRoute: Route = {
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

  it("should compute CB and energy correctly and call saveSnapshot", async () => {
    // Create in-memory mock for compliancePort
    const savedSnapshots: Array<{
      shipId: string;
      routeId?: string;
      year: number;
      cb_gco2eq: number;
      energy_mj: number;
      target_gco2eq_per_mj: number;
      actual_gco2eq_per_mj: number;
    }> = [];

    const mockCompliancePort: ICompliancePort = {
      saveSnapshot: jest.fn().mockImplementation(async (snapshot) => {
        savedSnapshots.push(snapshot);
      }),
      findLatestCB: jest.fn(),
    };

    const year = 2024;
    const target = 89.3368;

    // Call the use-case
    const result = await computeAndStoreCB(
      {
        route: sampleRoute,
        year,
        target,
      },
      {
        compliancePort: mockCompliancePort,
      }
    );

    // Verify computed values
    const expectedEnergyMJ = sampleRoute.fuelConsumptionT * 41000; // 5000 * 41000 = 205000000
    const expectedCB = (target - sampleRoute.ghgIntensity) * expectedEnergyMJ; // (89.3368 - 91.0) * 205000000

    expect(result.energy_mj).toBe(expectedEnergyMJ);
    expect(result.cb_gco2eq).toBeCloseTo(expectedCB, 2);
    expect(result.target).toBe(target);
    expect(result.actual).toBe(sampleRoute.ghgIntensity);

    // Verify saveSnapshot was called
    expect(mockCompliancePort.saveSnapshot).toHaveBeenCalledTimes(1);

    // Verify saveSnapshot was called with expected values
    expect(savedSnapshots).toHaveLength(1);
    const savedSnapshot = savedSnapshots[0];
    expect(savedSnapshot.shipId).toBe(sampleRoute.routeId);
    expect(savedSnapshot.routeId).toBe(sampleRoute.routeId);
    expect(savedSnapshot.year).toBe(year);
    expect(savedSnapshot.cb_gco2eq).toBeCloseTo(expectedCB, 2);
    expect(savedSnapshot.energy_mj).toBe(expectedEnergyMJ);
    expect(savedSnapshot.target_gco2eq_per_mj).toBe(target);
    expect(savedSnapshot.actual_gco2eq_per_mj).toBe(sampleRoute.ghgIntensity);
  });

  it("should use default target (89.3368) when not provided", async () => {
    const savedSnapshots: Array<{
      shipId: string;
      routeId?: string;
      year: number;
      cb_gco2eq: number;
      energy_mj: number;
      target_gco2eq_per_mj: number;
      actual_gco2eq_per_mj: number;
    }> = [];

    const mockCompliancePort: ICompliancePort = {
      saveSnapshot: jest.fn().mockImplementation(async (snapshot) => {
        savedSnapshots.push(snapshot);
      }),
      findLatestCB: jest.fn(),
    };

    const result = await computeAndStoreCB(
      {
        route: sampleRoute,
        year: 2024,
      },
      {
        compliancePort: mockCompliancePort,
      }
    );

    // Should use default target
    expect(result.target).toBe(89.3368);
    expect(savedSnapshots[0].target_gco2eq_per_mj).toBe(89.3368);
  });

  it("should calculate correct CB for different route values", async () => {
    const differentRoute: Route = {
      routeId: "R002",
      vesselType: "BulkCarrier",
      fuelType: "LNG",
      year: 2024,
      ghgIntensity: 88.0,
      fuelConsumptionT: 4800,
      distanceKm: 11500,
      totalEmissionsT: 4200,
      isBaseline: false,
    };

    const savedSnapshots: any[] = [];
    const mockCompliancePort: ICompliancePort = {
      saveSnapshot: jest.fn().mockImplementation(async (snapshot) => {
        savedSnapshots.push(snapshot);
      }),
      findLatestCB: jest.fn(),
    };

    const target = 89.3368;
    const result = await computeAndStoreCB(
      {
        route: differentRoute,
        year: 2024,
        target,
      },
      {
        compliancePort: mockCompliancePort,
      }
    );

    // Expected calculations
    const expectedEnergyMJ = 4800 * 41000; // 196800000
    const expectedCB = (target - 88.0) * expectedEnergyMJ; // (89.3368 - 88.0) * 196800000

    expect(result.energy_mj).toBe(expectedEnergyMJ);
    expect(result.cb_gco2eq).toBeCloseTo(expectedCB, 2);
    expect(result.actual).toBe(88.0);

    // Verify snapshot was saved with correct values
    expect(savedSnapshots[0].energy_mj).toBe(expectedEnergyMJ);
    expect(savedSnapshots[0].cb_gco2eq).toBeCloseTo(expectedCB, 2);
  });
});

