import { Route } from "../domain/Route";

/**
 * Port interface for routes repository operations.
 * This defines the contract for outbound adapters that handle route data persistence.
 */
export interface IRoutesPort {
  /**
   * Finds all routes from the data source
   * @returns Promise resolving to an array of all routes
   */
  findAll(): Promise<Route[]>;

  /**
   * Finds a route by its route ID
   * @param routeId - The unique route identifier
   * @returns Promise resolving to the route if found, null otherwise
   */
  findById(routeId: string): Promise<Route | null>;

  /**
   * Finds the baseline route
   * @returns Promise resolving to the baseline route if one exists, null otherwise
   */
  findBaseline(): Promise<Route | null>;

  /**
   * Sets a specific route as the baseline
   * @param routeId - The route ID to set as baseline
   * @returns Promise that resolves when the baseline is successfully set
   * @throws Error if the route is not found
   */
  setBaseline(routeId: string): Promise<void>;
}

