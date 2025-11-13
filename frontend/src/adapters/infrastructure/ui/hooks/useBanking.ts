// Directory: src/adapters/ui/hooks/
// File: useBanking.ts
import { useEffect, useState } from "react";
import { ShipCompliance, BankEntry } from "../../../core/domain/types";
import { apiClient } from "../infrastructure/apiClient";

/**
 * Hook for banking operations
 */
export function useBanking(shipId: string, year: number) {
  const [cb, setCB] = useState<ShipCompliance | null>(null);
  const [banked, setBanked] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const cbData = await apiClient.getComplianceCB(year);
      const shipCB = cbData.find((c) => c.shipId === shipId);
      if (shipCB) setCB(shipCB);

      const bankedData = await apiClient.getBankRecords(shipId, year);
      setBanked(bankedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch banking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shipId) {
      fetchData();
    }
  }, [shipId, year]);

  const bankCB = async (amount: number) => {
    try {
      await apiClient.bankCB(shipId, year, amount);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bank CB");
      throw err;
    }
  };

  const applyBanked = async (amount: number) => {
    try {
      await apiClient.applyBanked(shipId, year, amount);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply banked CB");
      throw err;
    }
  };

  return { cb, banked, loading, error, bankCB, applyBanked };
}