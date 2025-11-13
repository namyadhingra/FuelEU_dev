// Directory: src/core/application/
// File: computeCB.ts
/**
 * Compute CB and energy MJ from fuel consumption
 * @param target - Target intensity
 * @param actual - Actual intensity
 * @param fuelConsumptionT - Fuel consumption in tonnes
 * @returns Object with cb and energyMJ
 */
export function computeCB(
  target: number,
  actual: number,
  fuelConsumptionT: number
): { cb: number; energyMJ: number } {
  if (Number.isNaN(target)) {
    throw new Error("Invalid input: target must be a valid number (received NaN)");
  }
  if (Number.isNaN(actual)) {
    throw new Error("Invalid input: actual must be a valid number (received NaN)");
  }
  if (fuelConsumptionT < 0) {
    throw new Error(
      `Invalid input: fuelConsumptionT must be non-negative (received ${fuelConsumptionT})`
    );
  }

  const energyMJ = fuelConsumptionT * 41000;
  const cb = (target - actual) * energyMJ;

  return { cb, energyMJ };
}