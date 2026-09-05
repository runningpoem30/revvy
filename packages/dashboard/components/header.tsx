export default function Header() {
  return (
    <header className="flex items-center justify-between pb-6">
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm mb-1">
          <span className="text-zinc-400">Overview</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-zinc-300">
            <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-zinc-600 font-medium">Recoveries</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
          Recovery Dashboard
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-800 transition-colors shadow-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
          Export Audit Log
        </button>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2l5 5-5 5" />
          </svg>
          Run 50-Tx Simulation
        </button>
      </div>
    </header>
  );
}
