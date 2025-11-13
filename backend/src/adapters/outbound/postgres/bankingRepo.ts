import { Pool } from "pg";
import { IBankingPort } from "../../../core/ports/bankingPort";
import { getClient } from "./dbClient";

/**
 * PostgreSQL implementation of banking port.
 * Handles persistence and retrieval of banking entries.
 */
export class BankingRepo implements IBankingPort {
  private pool: Pool;

  constructor() {
    this.pool = getClient();
  }

  /**
   * Gets the sum of all banked amounts for a ship in a given year.
   * @param shipId - The ship identifier
   * @param year - The compliance year
   * @returns The sum of amount_gco2eq (positive for deposits, negative for consumption)
   */
  async getBankedSum(shipId: string, year: number): Promise<number> {
    const result = await this.pool.query(
      `SELECT COALESCE(SUM(amount_gco2eq), 0) as total 
       FROM bank_entries 
       WHERE ship_id = $1 AND year = $2`,
      [shipId, year]
    );

    return parseFloat(result.rows[0]?.total || "0");
  }

  /**
   * Inserts a new bank entry into the database.
   * @param entry - The bank entry data
   */
  async insertBankEntry(entry: {
    shipId: string;
    year: number;
    amount_gco2eq: number;
    note?: string;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO bank_entries (ship_id, year, amount_gco2eq, note)
       VALUES ($1, $2, $3, $4)`,
      [entry.shipId, entry.year, entry.amount_gco2eq, entry.note || null]
    );
  }

  /**
   * Lists all bank entries for a ship in a given year.
   * @param shipId - The ship identifier
   * @param year - The compliance year
   * @returns Array of bank entries with id, amount_gco2eq, and created_at as string
   */
  async listEntries(shipId: string, year: number): Promise<{
    id: number;
    amount_gco2eq: number;
    created_at: string;
  }[]> {
    const result = await this.pool.query(
      `SELECT id, amount_gco2eq, created_at
       FROM bank_entries
       WHERE ship_id = $1 AND year = $2
       ORDER BY created_at DESC`,
      [shipId, year]
    );

    return result.rows.map((row) => ({
      id: row.id,
      amount_gco2eq: parseFloat(row.amount_gco2eq),
      created_at: row.created_at instanceof Date 
        ? row.created_at.toISOString() 
        : String(row.created_at),
    }));
  }
}
