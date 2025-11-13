/**
 * Port interface for banking repository operations.
 * This defines the contract for outbound adapters that handle banking data persistence.
 */
export interface IBankingPort {
  /**
   * Gets the sum of all banked amounts for a ship in a given year
   * @param shipId - The ship identifier
   * @param year - The compliance year
   * @returns Promise resolving to the sum of banked amounts (positive for deposits, negative for consumption)
   */
  getBankedSum(shipId: string, year: number): Promise<number>;

  /**
   * Inserts a new bank entry
   * @param entry - The bank entry data
   * @param entry.shipId - The ship identifier
   * @param entry.year - The compliance year
   * @param entry.amount_gco2eq - The amount in gCO₂eq (positive for deposit, negative for consumption)
   * @param entry.note - Optional note for the bank entry
   * @returns Promise that resolves when the entry is successfully inserted
   */
  insertBankEntry(entry: { 
    shipId: string; 
    year: number; 
    amount_gco2eq: number; 
    note?: string 
  }): Promise<void>;

  /**
   * Lists all bank entries for a ship in a given year
   * @param shipId - The ship identifier
   * @param year - The compliance year
   * @returns Promise resolving to an array of bank entries with id, amount, and created_at timestamp
   */
  listEntries(shipId: string, year: number): Promise<{
    id: number;
    amount_gco2eq: number;
    created_at: string;
  }[]>;
}

