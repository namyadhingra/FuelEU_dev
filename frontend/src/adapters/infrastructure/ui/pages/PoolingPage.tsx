// Directory: src/adapters/ui/pages/
// File: PoolingPage.tsx
import React, { useState } from "react";
import { usePooling } from "../hooks/usePooling";
import { validatePool } from "../../../core/application/poolingLogic";

/**
 * Pooling tab page - manage compliance pooling per Article 21
 */
export function PoolingPage() {
  const [year, setYear] = useState(2024);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [poolMessage, setPoolMessage] = useState<string | null>(null);
  
  const { adjustedCBs, pools, loading, error, createPool } = usePooling(year);

  const selectedMembersData = adjustedCBs.filter(cb =>
    selectedMembers.includes(cb.shipId)
  );

  const poolSum = selectedMembersData.reduce((sum, cb) => sum + cb.cbGco2eq, 0);
  
  const validation = validatePool(selectedMembersData);
  const isValidPool = validation.isValid && selectedMembers.length > 0;

  const handleCreatePool = async () => {
    if (!isValidPool) return;
    try {
      await createPool(selectedMembers);
      setPoolMessage("Pool created successfully!");
      setSelectedMembers([]);
      setTimeout(() => setPoolMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Year Selection */}
      <div>
        <label className="block text-sm font-semibold mb-1">Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-32 px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Pool Sum Indicator */}
          <div
            className={`p-4 rounded border-2 ${
              isValidPool
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
            }`}
          >
            <div className="text-sm font-semibold text-gray-600">Pool Sum</div>
            <div
              className={`text-3xl font-bold ${
                isValidPool ? "text-green-600" : "text-red-600"
              }`}
            >
              {poolSum.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {isValidPool
                ? "✓ Valid pool (sum ≥ 0)"
                : "✗ Invalid pool (sum < 0)"}
            </div>
            {!validation.isValid && (
              <div className="mt-2 text-xs text-red-600">
                {validation.errors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}
          </div>

          {/* Member Selection */}
          <div className="border border-gray-300 rounded p-4">
            <h3 className="font-semibold mb-3">Select Pool Members</h3>
            {adjustedCBs.length === 0 ? (
              <p className="text-gray-500 text-sm">No members available</p>
            ) : (
              <div className="space-y-2">
                {adjustedCBs.map((entry) => (
                  <label key={entry.shipId} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(entry.shipId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, entry.shipId]);
                        } else {
                          setSelectedMembers(
                            selectedMembers.filter((id) => id !== entry.shipId)
                          );
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">
                      {entry.shipId} (CB: {entry.cbGco2eq.toFixed(0)})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Create Pool Button */}
          <button
            onClick={handleCreatePool}
            disabled={!isValidPool}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            Create Pool
          </button>

          {poolMessage && (
            <div className="p-4 bg-green-100 text-green-700 rounded border border-green-300">
              {poolMessage}
            </div>
          )}

          {/* Existing Pools */}
          {pools.length > 0 && (
            <div className="border border-gray-300 rounded p-4">
              <h3 className="font-semibold mb-3">Created Pools</h3>
              {pools.map((pool) => (
                <div key={pool.id} className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Pool {pool.id}</div>
                  <div className="text-xs text-gray-500">
                    Year {pool.year} • Created {new Date(pool.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2 text-xs space-y-1">
                    {pool.members.map((member) => (
                      <div key={member.shipId} className="flex justify-between">
                        <strong>{member.shipId}</strong>
                        <span>
                          {member.cbBefore.toFixed(0)} → {member.cbAfter.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}