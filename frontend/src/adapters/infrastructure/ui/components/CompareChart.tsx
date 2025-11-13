// Directory: src/adapters/ui/components/
// File: CompareChart.tsx
import React from "react";
import { ComparisonRow } from "../../../core/domain/types";

interface CompareChartProps {
  baseline: ComparisonRow | null;
  comparison: ComparisonRow[];
}

/**
 * Chart component displaying baseline vs comparison routes with compliance
 */
export function CompareChart({ baseline, comparison }: CompareChartProps) {
  if (!baseline) return <div className="text-gray-500">No baseline data</div>;

  const maxIntensity = Math.max(
    baseline.ghgIntensity,
    ...comparison.map((c) => c.ghgIntensity)
  );
  const scale = 100 / maxIntensity;

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="flex items-end gap-4 h-96 bg-white p-4 border border-gray-200 rounded">
        {/* Baseline */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div
            className="w-full bg-green-500 rounded"
            style={{ height: `${baseline.ghgIntensity * scale}%` }}
          ></div>
          <span className="text-sm font-semibold">{baseline.routeId}</span>
          <span className="text-xs">{baseline.ghgIntensity.toFixed(2)}</span>
        </div>

        {/* Comparison routes */}
        {comparison.map((route) => (
          <div key={route.id} className="flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-full rounded ${
                route.compliant ? "bg-blue-500" : "bg-red-500"
              }`}
              style={{ height: `${route.ghgIntensity * scale}%` }}
            ></div>
            <span className="text-sm font-semibold">{route.routeId}</span>
            <span className="text-xs">{route.ghgIntensity.toFixed(2)}</span>
            <span
              className={`text-xs font-bold ${
                route.percentDiff > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {route.percentDiff > 0 ? "+" : ""}
              {route.percentDiff.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Compliance Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Route ID</th>
              <th className="border p-2 text-right">GHG Intensity</th>
              <th className="border p-2 text-right">% Difference</th>
              <th className="border p-2 text-center">Compliant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-green-50">
              <td className="border p-2 font-semibold">{baseline.routeId}</td>
              <td className="border p-2 text-right">
                {baseline.ghgIntensity.toFixed(2)}
              </td>
              <td className="border p-2 text-right">0.0%</td>
              <td className="border p-2 text-center">
                <span className="text-green-600 font-bold">✓</span>
              </td>
            </tr>
            {comparison.map((route) => (
              <tr key={route.id}>
                <td className="border p-2">{route.routeId}</td>
                <td className="border p-2 text-right">
                  {route.ghgIntensity.toFixed(2)}
                </td>
                <td className="border p-2 text-right">
                  <span
                    className={
                      route.percentDiff > 0 ? "text-red-600" : "text-green-600"
                    }
                  >
                    {route.percentDiff > 0 ? "+" : ""}
                    {route.percentDiff.toFixed(2)}%
                  </span>
                </td>
                <td className="border p-2 text-center">
                  {route.compliant ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-red-600 font-bold">✗</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}