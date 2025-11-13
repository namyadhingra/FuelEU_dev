import { computeCB } from "../src/core/domain/CBCalculator";

/**
 * Jest TypeScript test suite for CBCalculator.computeCB function
 * 
 * Note: Ensure jest.config.js includes ts-jest preset and proper configuration.
 */

describe("CBCalculator.computeCB", () => {
  it("should calculate cb and energyMJ correctly for given inputs", () => {
    const target = 89.3368;
    const actual = 91.0;
    const fuelConsumptionT = 5000;

    const result = computeCB(target, actual, fuelConsumptionT);

    // Expected values
    const expectedEnergyMJ = fuelConsumptionT * 41000;
    const expectedCB = (target - actual) * expectedEnergyMJ;

    expect(result.energyMJ).toBe(expectedEnergyMJ);
    expect(result.cb).toBeCloseTo(expectedCB, 2);
  });

  it("should calculate energyMJ = 205000000", () => {
    const result = computeCB(89.3368, 91.0, 5000);
    expect(result.energyMJ).toBe(205000000);
  });

  it("should calculate cb close to -349183200", () => {
    const result = computeCB(89.3368, 91.0, 5000);
    expect(result.cb).toBeCloseTo(-349183200, 2);
  });

  it("should throw error when fuelConsumptionT is negative", () => {
    expect(() => computeCB(89.3368, 91.0, -5000)).toThrow(
      "Invalid input: fuelConsumptionT must be non-negative"
    );
  });

  it("should throw error when target is NaN", () => {
    expect(() => computeCB(NaN, 91.0, 5000)).toThrow(
      "Invalid input: target must be a valid number (received NaN)"
    );
  });

  it("should throw error when actual is NaN", () => {
    expect(() => computeCB(89.3368, NaN, 5000)).toThrow(
      "Invalid input: actual must be a valid number (received NaN)"
    );
  });
});