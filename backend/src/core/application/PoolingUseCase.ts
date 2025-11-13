import { IPoolingPort } from "../ports/poolingPort";

/**
 * Member with CB values for pooling
 */
export type PoolMember = {
  shipId: string;
  cb_before: number;
  cb_after?: number;
};

/**
 * Result of greedy pool allocation
 */
export type PoolAllocationResult = {
  members: Array<{
    shipId: string;
    cb_before: number;
    cb_after: number;
  }>;
};

/**
 * Creates a pool allocation using greedy algorithm.
 * Allocates surplus CB from ships with positive CB to ships with negative CB (deficits).
 * 
 * Algorithm:
 * 1. Validate that sum of all cb_before >= 0
 * 2. Sort members by cb_before descending (surplus ships first)
 * 3. For each surplus ship, allocate to deficits until deficits are zero or surplus exhausted
 * 4. Ensure no surplus goes negative
 * 5. Ensure deficits never get worse (cb_after >= cb_before for deficit ships)
 * 
 * @param members - Array of pool members with their CB values before pooling
 * @param ports - Port dependencies (not used in computation, but kept for interface consistency)
 * @returns Allocation result with cb_after values calculated
 * @throws Error if validation fails
 */
export function createPoolGreedy(
  members: Array<{ shipId: string; cb_before: number }>,
  ports: { poolingPort: IPoolingPort }
): PoolAllocationResult {
  // Validate input
  if (members.length === 0) {
    throw new Error("Pool must have at least one member");
  }

  // Make a deep copy to avoid mutating input
  const membersCopy: Array<{
    shipId: string;
    cb_before: number;
    cb_after?: number;
  }> = members.map((m) => ({
    shipId: m.shipId,
    cb_before: m.cb_before,
  }));

  // Calculate total CB
  const totalCB = membersCopy.reduce((sum, m) => sum + m.cb_before, 0);

  // Validation: Sum of cb_before must be >= 0
  if (totalCB < 0) {
    throw new Error(
      `Pool validation failed: Sum of cb_before (${totalCB}) must be >= 0`
    );
  }

  // Sort by cb_before descending (surplus ships first, then deficits)
  membersCopy.sort((a, b) => b.cb_before - a.cb_before);

  // Separate into surplus and deficit ships
  const surplusShips: Array<{
    shipId: string;
    cb_before: number;
    cb_after?: number;
  }> = [];
  const deficitShips: Array<{
    shipId: string;
    cb_before: number;
    cb_after?: number;
  }> = [];

  for (const member of membersCopy) {
    if (member.cb_before >= 0) {
      surplusShips.push(member);
    } else {
      deficitShips.push(member);
    }
  }

  // Initialize cb_after with cb_before
  for (const member of membersCopy) {
    member.cb_after = member.cb_before;
  }

  // Greedy allocation: allocate surplus to deficits
  let surplusIndex = 0;
  let deficitIndex = 0;

  while (surplusIndex < surplusShips.length && deficitIndex < deficitShips.length) {
    const surplusShip = surplusShips[surplusIndex];
    const deficitShip = deficitShips[deficitIndex];

    if (!surplusShip || !deficitShip) {
      break;
    }

    // Calculate how much deficit needs to be covered
    const deficitAmount = Math.abs(deficitShip.cb_before - (deficitShip.cb_after ?? deficitShip.cb_before));
    
    // Calculate how much surplus is available
    const surplusAmount = surplusShip.cb_after ?? surplusShip.cb_before;

    if (surplusAmount <= 0) {
      // This surplus ship is exhausted, move to next
      surplusIndex++;
      continue;
    }

    if (deficitAmount <= 0) {
      // This deficit is fully covered, move to next
      deficitIndex++;
      continue;
    }

    // Allocate as much as possible
    const allocation = Math.min(surplusAmount, deficitAmount);

    // Update cb_after values
    surplusShip.cb_after = (surplusShip.cb_after ?? surplusShip.cb_before) - allocation;
    deficitShip.cb_after = (deficitShip.cb_after ?? deficitShip.cb_before) + allocation;

    // Move to next deficit if this one is fully covered
    if (deficitShip.cb_after >= 0) {
      deficitIndex++;
    }

    // Move to next surplus if this one is exhausted
    if (surplusShip.cb_after <= 0) {
      surplusIndex++;
    }
  }

  // Validation: Ensure no surplus goes negative
  for (const member of surplusShips) {
    const cbAfter = member.cb_after ?? member.cb_before;
    if (cbAfter < 0) {
      throw new Error(
        `Pool validation failed: Surplus ship ${member.shipId} cannot exit negative (cb_after: ${cbAfter})`
      );
    }
  }

  // Validation: Ensure deficits never get worse
  for (const member of deficitShips) {
    const cbAfter = member.cb_after ?? member.cb_before;
    if (cbAfter < member.cb_before) {
      throw new Error(
        `Pool validation failed: Deficit ship ${member.shipId} cannot exit worse (cb_before: ${member.cb_before}, cb_after: ${cbAfter})`
      );
    }
  }

  // Return result with all members and their cb_after values
  return {
    members: membersCopy.map((m) => ({
      shipId: m.shipId,
      cb_before: m.cb_before,
      cb_after: m.cb_after ?? m.cb_before, // Default to cb_before if not set
    })),
  };
}
