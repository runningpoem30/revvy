"use client";

import { useState } from "react";
import { RecoveryJob, formatINR, maskContact } from "@/lib/mock-data";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    recovered: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Recovered",
    },
    intervention_sent: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "Intervention Sent",
    },
    escalated: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Escalated to Human",
    },
    pending: {
      bg: "bg-zinc-50 border-zinc-200",
      text: "text-zinc-500",
      dot: "bg-zinc-400",
      label: "Pending",
    },
  };

  const c = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function RootCauseBadge({ cause }: { cause: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
      {cause}
    </span>
  );
}

function InterventionLabel({ strategy }: { strategy: string }) {
  const labels: Record<string, string> = {
    PAYMENT_LINK_SMS: "Payment Link (SMS)",
    PAYMENT_LINK_EMAIL: "Payment Link (Email)",
    ESCALATE_TO_HUMAN: "Escalated",
  };
  return (
    <span className="text-sm text-zinc-600">
      {labels[strategy] || strategy}
    </span>
  );
}

function CopyIcon({ paymentId }: { paymentId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 text-zinc-300 hover:text-zinc-500 transition-colors"
      title="Copy Payment ID"
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l2.5 2.5L10 4" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1" />
          <path d="M8.5 4.5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h1.5" />
        </svg>
      )}
    </button>
  );
}

// Extract name from email
function nameFromEmail(email: string): string {
  const names: Record<string, string> = {
    "karan.sharma@outlook.com": "Karan Sharma",
    "priya.patel@gmail.com": "Priya Patel",
    "amit.singh@b2bcorp.in": "Amit Singh",
    "neha.gupta@yahoo.com": "Neha Gupta",
    "rohit.kumar@hotmail.com": "Rohit Kumar",
    "deepika.nair@company.co": "Deepika Nair",
    "sanjay.mehta@gmail.com": "Sanjay Mehta",
    "ananya.joshi@protonmail.com": "Ananya Joshi",
    "vikram.reddy@gmail.com": "Vikram Reddy",
    "meera.iyer@techstartup.io": "Meera Iyer",
  };
  if (!email || email === "void" || email === "void@razorpay.com") {
    return "Guest Customer";
  }
  return names[email] || email.split("@")[0].replace(".", " ");
}

export default function RecoveryTable({
  jobs,
  onSelectJob,
}: {
  jobs: RecoveryJob[];
  onSelectJob: (job: RecoveryJob) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Table Header Label */}
      <div className="px-6 py-4 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-800">
              Recovery Transactions
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {jobs.length} records from the RecoveryJob state machine
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Last synced: 2 min ago
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/60">
              <th className="text-left px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Payment ID
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Root Cause
              </th>
              <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                At-Risk Amount
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Intervention
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Status
              </th>
              <th className="text-right px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {jobs.map((job) => (
              <tr
                key={job.payment.id}
                onClick={() => onSelectJob(job)}
                className="table-row-hover hover:bg-zinc-50 cursor-pointer"
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center">
                    <span className="font-mono text-sm text-zinc-600">
                      {job.payment.id.slice(0, 18)}
                    </span>
                    <CopyIcon paymentId={job.payment.id} />
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-medium text-zinc-800">
                    {nameFromEmail(job.payment.email)}
                  </p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {maskContact(job.payment.contact)}
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <RootCauseBadge cause={job.recoveryAction.rootCause} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className="font-mono font-medium text-sm text-zinc-900">
                    {formatINR(job.payment.amount)}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <InterventionLabel strategy={job.recoveryAction.strategy} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={job.recoveryAction.status} />
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectJob(job);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table footer */}
      <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/40">
        <p className="text-xs text-zinc-400">
          Showing {jobs.length} of {jobs.length} recovery jobs
        </p>
      </div>
    </div>
  );
}
