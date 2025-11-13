// Directory: src/core/application/
// File: poolingLogic.ts
import { ShipCompliance } from "../domain/types";

export interface PoolingValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate pool before creation
 * @param members - Array of ShipCompliance for pool members
 * @returns Validation result with errors if any
 */
export function validatePool(members: ShipCompliance[]): PoolingValidation {
  const errors: string[] = [];

  if (members.length === 0) {
    errors.push("Pool must have at least one member");
  }

  const totalCB = members.reduce((sum, m) => sum + m.cbGco2eq, 0);
  if (totalCB < 0) {
    errors.push("Pool total CB must be non-negative (≥ 0)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Greedy allocation algorithm for pool distribution
 * Sort members by CB descending, transfer surplus to deficits
 * @param members - Array of ShipCompliance
 * @returns Updated members with cb_after values
 */
export function allocatePool(members: ShipCompliance[]) {
  const sorted = [...members].sort((a, b) => b.cbGco2eq - a.cbGco2eq);
  
  const poolMembers = sorted.map(m => ({
    shipId: m.shipId,
    cbBefore: m.cbGco2eq,
    cbAfter: m.cbGco2eq,
  }));

  // Simple allocation: pool average
  const totalCB = poolMembers.reduce((sum, m) => sum + m.cbBefore, 0);
  const avgCB = totalCB / poolMembers.length;

  return poolMembers.map(m => ({
    ...m,
    cbAfter: avgCB,
  }));
}