// Directory: src/core/ports/
// File: apiPort.ts
import {
  Route,
  ComparisonData,
  ShipCompliance,
  BankEntry,
  Pool,
} from "../domain/types";

/**
 * Port interface for API communication
 * Implementation in adapters/infrastructure/apiClient.ts
 */
export interface IApiPort {
  // Routes
  getRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<ComparisonData>;

  // Compliance
  getComplianceCB(year: number): Promise<ShipCompliance[]>;
  getAdjustedCB(year: number): Promise<ShipCompliance[]>;

  // Banking
  getBankRecords(shipId: string, year: number): Promise<BankEntry[]>;
  bankCB(shipId: string, year: number, amount: number): Promise<void>;
  applyBanked(shipId: string, year: number, amount: number): Promise<void>;

  // Pooling
  createPool(memberIds: string[], year: number): Promise<Pool>;
}