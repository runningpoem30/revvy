import { METRICS, formatINR } from "@/lib/mock-data";

export default function MetricsRow() {
  const recoveryRate =
    METRICS.atRiskTotal > 0
      ? ((METRICS.recoveredTotal / METRICS.atRiskTotal) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* At-Risk Revenue */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
          At-Risk Revenue
        </p>
        <p className="font-mono text-3xl font-semibold text-zinc-900 tracking-tight">
          {formatINR(METRICS.atRiskTotal)}
        </p>
        <p className="text-sm text-zinc-500 mt-1.5">
          {METRICS.atRiskCount} payments detected
        </p>
      </div>

      {/* Recovered Revenue */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
          Recovered Revenue
        </p>
        <p className="font-mono text-3xl font-semibold text-zinc-900 tracking-tight">
          {formatINR(METRICS.recoveredTotal)}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            {recoveryRate}% recovered
          </span>
        </div>
      </div>

      {/* Escalations & Exceptions */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
          Escalations &amp; Exceptions
        </p>
        <p className="font-mono text-3xl font-semibold text-zinc-900 tracking-tight">
          {METRICS.escalatedCount} Cases
        </p>
        <p className="text-sm text-zinc-500 mt-1.5">
          Bounded stopping rules applied
        </p>
      </div>
    </div>
  );
}
