"use client";

import { useState } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    id: "dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: "Recovery Jobs",
    id: "recovery",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 8A6 6 0 1 1 8 2" />
        <path d="M14 2v4h-4" />
      </svg>
    ),
  },
  {
    label: "Audit Trail",
    id: "audit",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
        <path d="M6 5h4M6 8h4M6 11h2" />
      </svg>
    ),
  },
  {
    label: "Synthetic Simulator",
    id: "simulator",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 2l6 6-6 6" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-zinc-200 flex flex-col z-30">
      {/* Header */}
      <div className="px-5 py-5 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-semibold tracking-tight text-zinc-900">
            revvy
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Test Mode
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
              active === item.id
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <span className={active === item.id ? "text-zinc-700" : "text-zinc-400"}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer — Merchant profile */}
      <div className="px-4 py-4 border-t border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-500">
            AS
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-800 truncate">
              Acme Store
            </p>
            <p className="text-xs text-zinc-400">Test Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
