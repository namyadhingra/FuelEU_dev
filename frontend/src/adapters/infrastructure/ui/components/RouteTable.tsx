// Directory: src/adapters/ui/components/
// File: RouteTable.tsx
import React, { useState } from "react";
import { Route } from "../../../core/domain/types";

interface RouteTableProps {
  routes: Route[];
  onSetBaseline: (routeId: string) => Promise<void>;
  loading?: boolean;
}

/**
 * Table component displaying all routes with filtering and baseline control
 */
export function RouteTable({
  routes,
  onSetBaseline,
  loading = false,
}: RouteTableProps) {
  const [filters, setFilters] = useState({
    vesselType: "",
    fuelType: "",
    year: "",
  });
  const [settingBaseline, setSettingBaseline] = useState<string | null>(null);

  const filteredRoutes = routes.filter((route) => {
    if (filters.vesselType && route.vesselType !== filters.vesselType)
      return false;
    if (filters.fuelType && route.fuelType !== filters.fuelType) return false;
    if (filters.year && route.year !== parseInt(filters.year)) return false;
    return true;
  });

  const vesselTypes = [...new Set(routes.map((r) => r.vesselType))];
  const fuelTypes = [...new Set(routes.map((r) => r.fuelType))];
  const years = [...new Set(routes.map((r) => r.year))];

  const handleSetBaseline = async (routeId: string) => {
    setSettingBaseline(routeId);
    try {
      await onSetBaseline(routeId);
    } finally {
      setSettingBaseline(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-3 gap-4">
        <select
          value={filters.vesselType}
          onChange={(e) =>
            setFilters({ ...filters, vesselType: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">All Vessel Types</option>
          {vesselTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={filters.fuelType}
          onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">All Fuel Types</option>
          {fuelTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Route ID</th>
              <th className="border p-2 text-left">Vessel Type</th>
              <th className="border p-2 text-left">Fuel Type</th>
              <th className="border p-2 text-center">Year</th>
              <th className="border p-2 text-right">GHG Intensity (gCO₂e/MJ)</th>
              <th className="border p-2 text-right">Fuel Consumption (t)</th>
              <th className="border p-2 text-right">Distance (km)</th>
              <th className="border p-2 text-right">Total Emissions (t)</th>
              <th className="border p-2 text-center">Baseline</th>
              <th className="border p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredRoutes.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  No routes found
                </td>
              </tr>
            ) : (
              filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="border p-2">{route.routeId}</td>
                  <td className="border p-2">{route.vesselType}</td>
                  <td className="border p-2">{route.fuelType}</td>
                  <td className="border p-2 text-center">{route.year}</td>
                  <td className="border p-2 text-right">
                    {route.ghgIntensity.toFixed(2)}
                  </td>
                  <td className="border p-2 text-right">
                    {route.fuelConsumptionT.toLocaleString()}
                  </td>
                  <td className="border p-2 text-right">
                    {route.distanceKm.toLocaleString()}
                  </td>
                  <td className="border p-2 text-right">
                    {route.totalEmissionsT.toFixed(2)}
                  </td>
                  <td className="border p-2 text-center">
                    {route.isBaseline ? (
                      <span className="text-green-600 font-semibold">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleSetBaseline(route.routeId)}
                      disabled={
                        settingBaseline === route.routeId ||
                        route.isBaseline ||
                        loading
                      }
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {settingBaseline === route.routeId ? "..." : "Set"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}