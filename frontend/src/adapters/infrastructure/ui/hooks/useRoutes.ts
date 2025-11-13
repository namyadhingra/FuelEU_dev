// Directory: src/adapters/ui/hooks/
// File: useRoutes.ts
import { useEffect, useState } from "react";
import { Route } from "../../../core/domain/types";
import { apiClient } from "../infrastructure/apiClient";

/**
 * Hook for fetching and managing routes
 */
export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getRoutes();
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const setBaseline = async (routeId: string) => {
    try {
      await apiClient.setBaseline(routeId);
      await fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set baseline");
      throw err;
    }
  };

  return { routes, loading, error, setBaseline, refetch: fetchRoutes };
}