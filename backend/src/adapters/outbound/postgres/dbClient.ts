import { Pool } from "pg";

/**
 * Creates and returns a PostgreSQL connection pool.
 * Reads configuration from environment variables:
 * - PGHOST: Database host
 * - PGUSER: Database user
 * - PGPASSWORD: Database password
 * - PGDATABASE: Database name
 * - PGPORT: Database port (default: 5432)
 * 
 * @returns A Pool instance (connection is established lazily on first query)
 * 
 * @note To close the pool when done, call: await pool.end()
 * 
 * @example
 * const pool = getClient();
 * try {
 *   const result = await pool.query('SELECT * FROM routes');
 *   console.log(result.rows);
 * } finally {
 *   await pool.end();
 * }
 */
export function getClient(): Pool {
  const pool = new Pool({
    host: process.env.PGHOST || "localhost",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "",
    database: process.env.PGDATABASE || "fueleu",
    port: parseInt(process.env.PGPORT || "5432", 10),
  });

  return pool;
}