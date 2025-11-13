/**
 * Computes the carbon balance (CB) and energy in megajoules (MJ) based on target and actual fuel consumption.
 * 
 * @param target - The target fuel consumption value (must be a valid number)
 * @param actual - The actual fuel consumption value (must be a valid number)
 * @param fuelConsumptionT - The fuel consumption in tonnes (must be non-negative)
 * @returns An object containing the calculated cb and energyMJ values
 * @throws {Error} If fuelConsumptionT is negative
 * @throws {Error} If target or actual is NaN
 * 
 * @example
 * const result = computeCB(100, 80, 50);
 * console.log(result); // { cb: 41000000, energyMJ: 2050000 }
 */
export function computeCB(
  target: number,
  actual: number,
  fuelConsumptionT: number
): { cb: number; energyMJ: number } {
  // Validate that target and actual are not NaN
  if (Number.isNaN(target)) {
    throw new Error("Invalid input: target must be a valid number (received NaN)");
  }
  if (Number.isNaN(actual)) {
    throw new Error("Invalid input: actual must be a valid number (received NaN)");
  }

  // Validate that fuelConsumptionT is not negative
  if (fuelConsumptionT < 0) {
    throw new Error(
      `Invalid input: fuelConsumptionT must be non-negative (received ${fuelConsumptionT})`
    );
  }

  // Calculate energyMJ
  const energyMJ: number = fuelConsumptionT * 41000;

  // Calculate cb
  const cb: number = (target - actual) * energyMJ;

  return { cb, energyMJ };
}

// Example usage:
// const result = computeCB(100, 80, 50);
// console.log(result); // { cb: 41000000, energyMJ: 2050000 }
//
// try {
//   computeCB(NaN, 80, 50);
// } catch (error) {
//   console.error(error.message); // Error: Invalid input: target must be a valid number (received NaN)
// }
//
// try {
//   computeCB(100, 80, -5);
// } catch (error) {
//   console.error(error.message); // Error: Invalid input: fuelConsumptionT must be non-negative (received -5)
// }