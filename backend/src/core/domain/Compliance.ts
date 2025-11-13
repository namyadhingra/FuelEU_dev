/**
 * Represents compliance data for a ship/route
 */
export type Compliance = {
  id?: number;
  shipId: string;
  routeId?: string | null;
  year: number;
  cbGco2eq: number;
  energyMj: number;
  targetGco2eqPerMj: number;
  actualGco2eqPerMj: number;
  createdAt?: Date;
};

/**
 * Represents a bank entry (banked CB)
 * amountGco2eq: positive for deposit, negative for consumption
 */
export type BankEntry = {
  id?: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  note?: string | null;
  createdAt?: Date;
};

/**
 * Represents a pool
 */
export type Pool = {
  id?: number;
  year: number;
  createdAt?: Date;
};

/**
 * Represents a pool member
 */
export type PoolMember = {
  id?: number;
  poolId: number;
  shipId: string;
  cbBefore: number;
  cbAfter: number | null;
  createdAt?: Date;
};

/**
 * Represents comparison data between baseline and other routes
 */
export type RouteComparison = {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  percentDifference: number;
  compliant: boolean;
};

/**
 * Represents Carbon Balance data
 */
export type CarbonBalance = {
  cbBefore: number;
  applied: number;
  cbAfter: number;
};

/**
 * Represents adjusted CB per ship
 */
export type AdjustedCB = {
  shipId: string;
  adjustedCB: number;
};

