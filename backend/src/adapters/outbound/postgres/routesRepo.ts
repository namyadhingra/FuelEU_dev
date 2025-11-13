import { Pool } from "pg";
import { fromRow, Route } from "../../../core/domain/Route";
import { getClient } from "./dbClient";

/**
 * Interface for routes repository operations
 */
export interface IRoutesRepo {
  findAll(): Promise<Route[]>;
  findById(routeId: string): Promise<Route | null>;
  findBaseline(): Promise<Route | null>;
  setBaseline(routeId: string): Promise<void>;
}

/**
 * PostgreSQL implementation of routes repository
 */
export class RoutesRepo implements IRoutesRepo {
  private pool: Pool;

  constructor() {
    this.pool = getClient();
  }

  /**
   * Fetches all routes from the database ordered by id
   * 
   * @returns Promise<Route[]> Array of all routes
   * @throws {Error} If database query fails
   */
  async findAll(): Promise<Route[]> {
    const res = await this.pool.query(`SELECT * FROM routes ORDER BY id`);
    return res.rows.map(fromRow);
  }

  /**
   * Fetches a single route by route_id
   * 
   * @param routeId - The route_id to search for
   * @returns Promise<Route | null> The route if found, null otherwise
   * @throws {Error} If database query fails
   */
  async findById(routeId: string): Promise<Route | null> {
    const res = await this.pool.query(
      `SELECT * FROM routes WHERE route_id = $1 LIMIT 1`,
      [routeId]
    );
    if (res.rows.length === 0) return null;
    return fromRow(res.rows[0]);
  }

  /**
   * Fetches the current baseline route
   * 
   * @returns Promise<Route | null> The baseline route if one exists, null otherwise
   * @throws {Error} If database query fails
   */
  async findBaseline(): Promise<Route | null> {
    const res = await this.pool.query(
      `SELECT * FROM routes WHERE is_baseline = TRUE LIMIT 1`
    );
    if (res.rows.length === 0) return null;
    return fromRow(res.rows[0]);
  }

  /**
   * Sets a specific route as the baseline (transactional operation)
   * 
   * Clears any existing baseline and sets the given routeId as the new baseline.
   * Uses a database transaction to ensure consistency.
   * 
   * @param routeId - The route_id to set as baseline
   * @throws {Error} If route not found or database operation fails
   * 
   * @example
   * await routesRepo.setBaseline('R001');
   */
  async setBaseline(routeId: string): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Clear all previous baselines
      await client.query(`UPDATE routes SET is_baseline = FALSE`);

      // 2. Set the new baseline
      const result = await client.query(
        `UPDATE routes SET is_baseline = TRUE WHERE route_id = $1`,
        [routeId]
      );

      // 3. Verify the route exists and was updated
      if (result.rowCount === 0) {
        throw new Error(`Route with id '${routeId}' not found`);
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

/*
Usage:

import { RoutesRepo } from "../../outbound/postgres/routesRepo";

const routesRepo = new RoutesRepo();

// Fetch all routes
const allRoutes = await routesRepo.findAll();

// Find a specific route
const route = await routesRepo.findById('R001');

// Get current baseline
const baseline = await routesRepo.findBaseline();

// Set a new baseline
await routesRepo.setBaseline('R002');
*/