// Directory: src/adapters/ui/pages/
// File: RoutesPage.tsx
import React from "react";
import { RouteTable } from "../components/RouteTable";
import { useRoutes } from "../hooks/useRoutes";

/**
 * Routes tab page - display all routes with filtering and baseline management
 */
export function RoutesPage() {
  const { routes, loading, error, setBaseline } = useRoutes();

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}
      <RouteTable routes={routes} onSetBaseline={setBaseline} loading={loading} />
    </div>
  );
}