// Directory: src/adapters/ui/
// File: App.tsx
import React from "react";
import { Tabs } from "./components/Tabs";
import { RoutesPage } from "./pages/RoutesPage";
import { ComparePage } from "./pages/ComparePage";
import { BankingPage } from "./pages/BankingPage";
import { PoolingPage } from "./pages/PoolingPage";

/**
 * Main application component with tab navigation
 */
export function App() {
  const tabs = [
    { label: "Routes", content: <RoutesPage /> },
    { label: "Compare", content: <ComparePage /> },
    { label: "Banking", content: <BankingPage /> },
    { label: "Pooling", content: <PoolingPage /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Fuel EU Compliance Dashboard</h1>
          <p className="text-sm opacity-90">
            Monitor routes, banking, and pooling compliance
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs tabs={tabs} />
      </main>

      <footer className="bg-gray-900 text-gray-300 text-center py-4 mt-12">
        <p>Fuel EU Dashboard © 2025</p>
      </footer>
    </div>
  );
}