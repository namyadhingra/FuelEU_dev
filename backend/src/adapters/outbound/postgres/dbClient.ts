import { Pool } from "pg";

/**
 * Creates and returns a connected PostgreSQL connection pool.
 * Reads configuration from environment variables:
 * - PGHOST: Database host
 * - PGUSER: Database user
 * - PGPASSWORD: Database password
 * - PGDATABASE: Database name
 * - PGPORT: Database port (default: 5432)
 * 
 * @returns A connected Pool instance
 * @throws {Error} If connection fails
 * 
 * @note To close the pool when done, call: await pool.end()
 * 
 * @example
 * const pool = await getClient();
 * try {
 *   const result = await pool.query('SELECT * FROM routes');
 *   console.log(result.rows);
 * } finally {
 *   await pool.end();
 * }
 */
export async function getClient(): Promise<Pool> {
  const pool = new Pool({
    host: process.env.PGHOST || "localhost",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "",
    database: process.env.PGDATABASE || "fueleu",
    port: parseInt(process.env.PGPORT || "5432", 10),
  });

  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
  } catch (error) {
    await pool.end();
    throw new Error(
      `Failed to connect to PostgreSQL database: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return pool;
}