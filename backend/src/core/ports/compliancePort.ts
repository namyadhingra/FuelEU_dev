/**
 * Port interface for compliance repository operations.
 * This defines the contract for outbound adapters that handle compliance data persistence.
 */
export interface ICompliancePort {
  /**
   * Saves a compliance snapshot for a ship/route
   * @param snapshot - The compliance snapshot data
   * @param snapshot.shipId - The ship identifier
   * @param snapshot.routeId - Optional route identifier
   * @param snapshot.year - The compliance year
   * @param snapshot.cb_gco2eq - Carbon balance in gCO₂eq
   * @param snapshot.energy_mj - Energy in megajoules
   * @param snapshot.target_gco2eq_per_mj - Target GHG intensity in gCO₂eq/MJ
   * @param snapshot.actual_gco2eq_per_mj - Actual GHG intensity in gCO₂eq/MJ
   * @returns Promise that resolves when the snapshot is successfully saved
   */
  saveSnapshot(snapshot: {
    shipId: string;
    routeId?: string;
    year: number;
    cb_gco2eq: number;
    energy_mj: number;
    target_gco2eq_per_mj: number;
    actual_gco2eq_per_mj: number;
  }): Promise<void>;

  /**
   * Finds the latest carbon balance for a ship in a given year
   * @param shipId - The ship identifier
   * @param year - The compliance year
   * @returns Promise resolving to the latest CB data if found, null otherwise
   */
  findLatestCB(shipId: string, year: number): Promise<{
    cb_gco2eq: number;
    energy_mj: number;
  } | null>;
}

