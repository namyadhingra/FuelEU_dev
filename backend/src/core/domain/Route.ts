/**
 * Represents a shipping route with fuel consumption and emissions data.
 */
export type Route = {
  id?: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumptionT: number;
  distanceKm: number;
  totalEmissionsT: number;
  isBaseline?: boolean;
};

/**
 * Maps a database row in snake_case format to a Route object.
 * 
 * @param row - The database row object with snake_case property names
 * @returns A Route object with camelCase property names
 * @throws {Error} If required fields are missing or invalid
 * 
 * @example
 * const row = {
 *   id: 1,
 *   route_id: "RT001",
 *   vessel_type: "Container Ship",
 *   fuel_type: "HFO",
 *   year: 2024,
 *   ghg_intensity: 12.5,
 *   fuel_consumption_t: 50,
 *   distance_km: 1200,
 *   total_emissions_t: 625,
 *   is_baseline: true
 * };
 * const route = fromRow(row);
 */
export function fromRow(row: any): Route {
  if (!row) {
    throw new Error("Invalid input: row must be a valid object");
  }

  if (!row.route_id) {
    throw new Error("Invalid row: missing required field 'route_id'");
  }

  if (!row.vessel_type) {
    throw new Error("Invalid row: missing required field 'vessel_type'");
  }

  if (!row.fuel_type) {
    throw new Error("Invalid row: missing required field 'fuel_type'");
  }

  if (row.year === undefined || row.year === null) {
    throw new Error("Invalid row: missing required field 'year'");
  }

  if (row.ghg_intensity === undefined || row.ghg_intensity === null) {
    throw new Error("Invalid row: missing required field 'ghg_intensity'");
  }

  if (row.fuel_consumption_t === undefined || row.fuel_consumption_t === null) {
    throw new Error("Invalid row: missing required field 'fuel_consumption_t'");
  }

  if (row.distance_km === undefined || row.distance_km === null) {
    throw new Error("Invalid row: missing required field 'distance_km'");
  }

  if (row.total_emissions_t === undefined || row.total_emissions_t === null) {
    throw new Error("Invalid row: missing required field 'total_emissions_t'");
  }

  const route: Route = {
    id: row.id,
    routeId: row.route_id,
    vesselType: row.vessel_type,
    fuelType: row.fuel_type,
    year: row.year,
    ghgIntensity: row.ghg_intensity,
    fuelConsumptionT: row.fuel_consumption_t,
    distanceKm: row.distance_km,
    totalEmissionsT: row.total_emissions_t,
    isBaseline: row.is_baseline,
  };

  return route;
}