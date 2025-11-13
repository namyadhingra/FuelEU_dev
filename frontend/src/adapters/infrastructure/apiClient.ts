import { API_BASE } from "../../shared/constants";
import type { IApiPort } from "../../core/ports/apiPort";
import type { Route, CBRecord } from "../../core/domain/types";

async function safeFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { ...opts, credentials: "same-origin" });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const apiClient: IApiPort = {
  async getRoutes() {
    return (await safeFetch(`${API_BASE}/routes`)) as Route[];
  },

  async setBaseline(routeId: string) {
    await safeFetch(`${API_BASE}/routes/${encodeURIComponent(routeId)}/baseline`, { method: "POST" });
  },

  async getComparison() {
    return (await safeFetch(`${API_BASE}/routes/comparison`)) as { baseline: Route; comparisons: Route[] };
  },

  async getCB(routeId: string, year: number) {
    return (await safeFetch(`${API_BASE}/compliance/cb?routeId=${encodeURIComponent(routeId)}&year=${year}`)) as CBRecord;
  },

  async getAdjustedCB(year: number) {
    return (await safeFetch(`${API_BASE}/compliance/adjusted-cb?year=${year}`)) as { shipId: string; cb: number }[];
  },

  async getBankRecords(shipId: string, year: number) {
    return (await safeFetch(`${API_BASE}/banking/records?shipId=${encodeURIComponent(shipId)}&year=${year}`));
  },

  async postBank(shipId: string, year: number, amount: number) {
    return (await safeFetch(`${API_BASE}/banking/bank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, year, amount })
    }));
  },

  async postApply(shipId: string, year: number, amount: number) {
    return (await safeFetch(`${API_BASE}/banking/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, year, amount })
    }));
  },

  async createPool(year: number, members: { shipId: string; cb_before: number; cb_after?: number }[]) {
    return (await safeFetch(`${API_BASE}/pools`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, members })
    }));
  }
};
