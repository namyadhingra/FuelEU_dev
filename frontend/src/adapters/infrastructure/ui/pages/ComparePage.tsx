// Directory: src/adapters/ui/pages/
// File: ComparePage.tsx
import React from "react";
import { CompareChart } from "../components/CompareChart";
import { useComparison } from "../hooks/useComparison";

/**
 * Compare tab page - display baseline vs comparison routes with compliance metrics
 */
export function ComparePage() {
  const { baseline, data, loading, error } = useComparison();

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}
      <CompareChart baseline={baseline} comparison={data} />
    </div>
  );
}