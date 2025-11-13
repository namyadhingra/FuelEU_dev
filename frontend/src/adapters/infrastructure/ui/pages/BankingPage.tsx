// Directory: src/adapters/ui/pages/
// File: BankingPage.tsx
import React, { useState } from "react";
import { useBanking } from "../hooks/useBanking";

/**
 * Banking tab page - manage CB banking and application per Article 20
 */
export function BankingPage() {
  const [shipId, setShipId] = useState("R001");
  const [year, setYear] = useState(2024);
  const [bankAmount, setBankAmount] = useState(0);
  const [applyAmount, setApplyAmount] = useState(0);
  const [bankMessage, setBankMessage] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  
  const { cb, banked, loading, error, bankCB, applyBanked } = useBanking(
    shipId,
    year
  );

  const canBank = cb && cb.cbGco2eq > 0;
  const totalBanked = banked.reduce((sum, b) => sum + b.amountGco2eq, 0);

  const handleBank = async () => {
    try {
      await bankCB(bankAmount);
      setBankMessage(`Successfully banked ${bankAmount.toFixed(0)} gCO₂eq`);
      setBankAmount(0);
      setTimeout(() => setBankMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    try {
      await applyBanked(applyAmount);
      setApplyMessage(`Successfully applied ${applyAmount.toFixed(0)} gCO₂eq`);
      setApplyAmount(0);
      setTimeout(() => setApplyMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Ship and Year Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Ship ID</label>
          <input
            type="text"
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="text-xs text-gray-600">CB Before</div>
              <div className="text-2xl font-bold">
                {cb ? cb.cbGco2eq.toFixed(0) : "—"}
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-xs text-gray-600">Banked Total</div>
              <div className="text-2xl font-bold">{totalBanked.toFixed(0)}</div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <div className="text-xs text-gray-600">CB After</div>
              <div className="text-2xl font-bold">
                {cb ? (cb.cbGco2eq + totalBanked).toFixed(0) : "—"}
              </div>
            </div>
          </div>

          {/* Bank CB Section */}
          <div className="border border-gray-300 rounded p-4">
            <h3 className="font-semibold mb-3">Bank CB</h3>
            {bankMessage && (
              <div className="p-2 bg-green-100 text-green-700 rounded mb-3 text-sm">
                {bankMessage}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="number"
                value={bankAmount}
                onChange={(e) => setBankAmount(parseFloat(e.target.value) || 0)}
                disabled={!canBank}
                placeholder="Amount to bank"
                className="flex-1 px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100"
              />
              <button
                onClick={handleBank}
                disabled={!canBank || bankAmount <= 0}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Bank
              </button>
            </div>
            {!canBank && (
              <p className="text-sm text-red-600 mt-2">CB must be positive to bank</p>
            )}
          </div>

          {/* Apply Banked Section */}
          <div className="border border-gray-300 rounded p-4">
            <h3 className="font-semibold mb-3">Apply Banked CB</h3>
            {applyMessage && (
              <div className="p-2 bg-green-100 text-green-700 rounded mb-3 text-sm">
                {applyMessage}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="number"
                value={applyAmount}
                onChange={(e) => setApplyAmount(parseFloat(e.target.value) || 0)}
                disabled={totalBanked <= 0}
                placeholder="Amount to apply"
                max={totalBanked}
                className="flex-1 px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100"
              />
              <button
                onClick={handleApply}
                disabled={totalBanked <= 0 || applyAmount <= 0 || applyAmount > totalBanked}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
            {totalBanked <= 0 && (
              <p className="text-sm text-gray-600 mt-2">No banked CB available</p>
            )}
            {applyAmount > totalBanked && (
              <p className="text-sm text-red-600 mt-2">Cannot apply more than banked amount</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}