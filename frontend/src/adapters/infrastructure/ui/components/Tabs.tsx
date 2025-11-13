// Directory: src/adapters/ui/components/
// File: Tabs.tsx
import React, { useState } from "react";

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
}

/**
 * Tab navigation component
 */
export function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-300">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === index
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6">{tabs[activeTab].content}</div>
    </div>
  );
}