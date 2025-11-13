import { Pool } from "pg";
import { IPoolingPort } from "../../../core/ports/poolingPort";
import { getClient } from "./dbClient";

/**
 * PostgreSQL implementation of pooling port.
 * Handles creation of pools with members in a transactional manner.
 */
export class PoolingRepo implements IPoolingPort {
  private pool: Pool;

  constructor() {
    this.pool = getClient();
  }

  /**
   * Creates a new pool with members in a transaction.
   * @param year - The compliance year for the pool
   * @param members - Array of pool members with their CB values
   * @returns The created pool ID
   * @throws Error if transaction fails (automatically rolled back)
   */
  async createPool(
    year: number,
    members: {
      shipId: string;
      cb_before: number;
      cb_after?: number;
    }[]
  ): Promise<{ poolId: number }> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Insert into pools table and get the pool ID
      const poolResult = await client.query(
        `INSERT INTO pools (year) VALUES ($1) RETURNING id`,
        [year]
      );

      const poolId = poolResult.rows[0].id;

      // Insert pool members for each member
      for (const member of members) {
        await client.query(
          `INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after)
           VALUES ($1, $2, $3, $4)`,
          [poolId, member.shipId, member.cb_before, member.cb_after || null]
        );
      }

      await client.query("COMMIT");

      return { poolId };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
