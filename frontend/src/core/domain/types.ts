// Directory: src/core/domain/
// File: types.ts
/**
 * Domain types for Fuel EU Compliance Dashboard
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

export type ComparisonData = {
  baseline: Route;
  comparison: Route[];
};

export type ComparisonRow = Route & {
  percentDiff: number;
  compliant: boolean;
};

export type ShipCompliance = {
  id: number;
  shipId: string;
  year: number;
  cbGco2eq: number;
};

export type BankEntry = {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
};

export type PoolMember = {
  poolId: number;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
};

export type Pool = {
  id: number;
  year: number;
  createdAt: string;
  members: PoolMember[];
};