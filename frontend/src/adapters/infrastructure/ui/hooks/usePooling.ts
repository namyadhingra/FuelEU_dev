// Directory: src/adapters/ui/hooks/
// File: usePooling.ts
import { useEffect, useState } from "react";
import { ShipCompliance, Pool } from "../../../core/domain/types";
import { apiClient } from "../infrastructure/apiClient";

/**
 * Hook for pooling operations
 */
export function usePooling(year: number) {
  const [adjustedCBs, setAdjustedCBs] = useState<ShipCompliance[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const acbs = await apiClient.getAdjustedCB(year);
      setAdjustedCBs(acbs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch adjusted CBs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const createPool = async (memberIds: string[]) => {
    try {
      const pool = await apiClient.createPool(memberIds, year);
      setPools([...pools, pool]);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pool");
      throw err;
    }
  };

  return { adjustedCBs, pools, loading, error, createPool };
}