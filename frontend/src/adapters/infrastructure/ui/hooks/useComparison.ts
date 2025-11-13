// Directory: src/adapters/ui/hooks/
// File: useComparison.ts
import { useEffect, useState } from "react";
import { ComparisonRow } from "../../../core/domain/types";
import { apiClient } from "../infrastructure/apiClient";
import { calculateComparisonRow } from "../../../core/application/compareUsecase";

/**
 * Hook for fetching and calculating comparison data
 */
export function useComparison() {
  const [data, setData] = useState<ComparisonRow[]>([]);
  const [baseline, setBaseline] = useState<ComparisonRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      setError(null);
      try {
        const compData = await apiClient.getComparison();
        setBaseline(calculateComparisonRow(compData.baseline));
        setData(compData.comparison.map(calculateComparisonRow));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch comparison");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, []);

  return { data, baseline, loading, error };
}