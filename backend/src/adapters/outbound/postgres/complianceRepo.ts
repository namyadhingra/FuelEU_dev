import { Pool } from "pg";
import { ICompliancePort } from "../../../core/ports/compliancePort";
import { getClient } from "./dbClient";

/**
 * PostgreSQL implementation of compliance port.
 * Handles persistence of compliance snapshots and retrieval of carbon balance data.
 */
export class ComplianceRepo implements ICompliancePort {
  private pool: Pool;

  constructor() {
    this.pool = getClient();
  }

  /**
   * Saves a compliance snapshot to the database.
   * @param snapshot - The compliance snapshot data with snake_case field names
   */
  async saveSnapshot(snapshot: {
    shipId: string;
    routeId?: string;
    year: number;
    cb_gco2eq: number;
    energy_mj: number;
    target_gco2eq_per_mj: number;
    actual_gco2eq_per_mj: number;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO ship_compliance (ship_id, route_id, year, cb_gco2eq, energy_mj, target_gco2eq_per_mj, actual_gco2eq_per_mj)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        snapshot.shipId,
        snapshot.routeId || null,
        snapshot.year,
        snapshot.cb_gco2eq,
        snapshot.energy_mj,
        snapshot.target_gco2eq_per_mj,
        snapshot.actual_gco2eq_per_mj,
      ]
    );
  }

  /**
   * Finds the latest carbon balance for a ship in a given year.
   * @param shipId - The ship identifier
   * @param year - The compliance year
   * @returns The latest CB data with parsed numbers, or null if not found
   */
  async findLatestCB(shipId: string, year: number): Promise<{
    cb_gco2eq: number;
    energy_mj: number;
  } | null> {
    const result = await this.pool.query(
      `SELECT cb_gco2eq, energy_mj 
       FROM ship_compliance 
       WHERE ship_id = $1 AND year = $2 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [shipId, year]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      cb_gco2eq: parseFloat(row.cb_gco2eq),
      energy_mj: parseFloat(row.energy_mj),
    };
  }
}
