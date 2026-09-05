import { RecoveryJob, formatINR } from "@/lib/mock-data";

function computeMetrics(jobs: RecoveryJob[]) {
  return {
    atRiskTotal: jobs.reduce((sum, j) => sum + j.payment.amount, 0),
    atRiskCount: jobs.length,
    recoveredTotal: jobs.reduce(
      (sum, j) => sum + (j.recoveryAction.recoveryAmount ?? 0),
      0
    ),
    recoveredCount: jobs.filter((j) => j.recoveryAction.status === "recovered").length,
    escalatedCount: jobs.filter((j) => j.recoveryAction.status === "escalated").length,
  };
}

export default function MetricsRow({ jobs }: { jobs: RecoveryJob[] }) {
  const metrics = computeMetrics(jobs);

  const recoveryRate =
    metrics.atRiskTotal > 0
      ? ((metrics.recoveredTotal / metrics.atRiskTotal) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* At-Risk Revenue */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
          At-Risk Revenue
        </p>
        <p className="font-mono text-3xl font-semibold text-zinc-900 tracking-tight">
          {formatINR(metrics.atRiskTotal)}
        </p>
        <p className="text-sm text-zinc-500 mt-1.5">
          {metrics.atRiskCount} payments detected
        </p>
      </div>

      {/* Recovered Revenue */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
          Recovered Revenue
        </p>
        <p className="font-mono text-3xl font-semibold text-zinc-900 tracking-tight">
          {formatINR(metrics.recoveredTotal)}
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
          {metrics.escalatedCount} Cases
        </p>
        <p className="text-sm text-zinc-500 mt-1.5">
          Bounded stopping rules applied
        </p>
      </div>
    </div>
  );
}
