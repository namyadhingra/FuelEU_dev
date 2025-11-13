/**
 * Port interface for pooling repository operations.
 * This defines the contract for outbound adapters that handle pool data persistence.
 */
export interface IPoolingPort {
  /**
   * Creates a new pool with members
   * @param year - The compliance year for the pool
   * @param members - Array of pool members with their CB values
   * @param members[].shipId - The ship identifier
   * @param members[].cb_before - Carbon balance before pooling
   * @param members[].cb_after - Optional carbon balance after pooling
   * @returns Promise resolving to the created pool ID
   */
  createPool(year: number, members: { 
    shipId: string; 
    cb_before: number; 
    cb_after?: number 
  }[]): Promise<{ poolId: number }>;
}

