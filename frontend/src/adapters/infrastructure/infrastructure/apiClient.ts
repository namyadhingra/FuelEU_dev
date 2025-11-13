// Directory: src/adapters/infrastructure/
// File: apiClient.ts
import { IApiPort } from "../../core/ports/apiPort";
import {
  Route,
  ComparisonData,
  ShipCompliance,
  BankEntry,
  Pool,
} from "../../core/domain/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * API Client implementation
 * Communicates with backend Fuel EU API
 */
class ApiClient implements IApiPort {
  /**
   * Make HTTP request to backend
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getRoutes(): Promise<Route[]> {
    return this.request("GET", "/routes");
  }

  async setBaseline(routeId: string): Promise<void> {
    return this.request("POST", `/routes/${routeId}/baseline`);
  }

  async getComparison(): Promise<ComparisonData> {
    return this.request("GET", "/routes/comparison");
  }

  async getComplianceCB(year: number): Promise<ShipCompliance[]> {
    return this.request("GET", `/compliance/cb?year=${year}`);
  }

  async getAdjustedCB(year: number): Promise<ShipCompliance[]> {
    return this.request("GET", `/compliance/adjusted-cb?year=${year}`);
  }

  async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return this.request("GET", `/banking/records?shipId=${shipId}&year=${year}`);
  }

  async bankCB(shipId: string, year: number, amount: number): Promise<void> {
    return this.request("POST", "/banking/bank", { shipId, year, amount });
  }

  async applyBanked(
    shipId: string,
    year: number,
    amount: number
  ): Promise<void> {
    return this.request("POST", "/banking/apply", { shipId, year, amount });
  }

  async createPool(memberIds: string[], year: number): Promise<Pool> {
    return this.request("POST", "/pools", { memberIds, year });
  }
}

export const apiClient = new ApiClient();