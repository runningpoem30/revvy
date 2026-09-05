"use client";

import { useEffect } from "react";
import { RecoveryJob, formatINR, maskContact } from "@/lib/mock-data";

function KeyValue({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-xs text-zinc-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm text-zinc-800 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-zinc-700 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-sm font-medium text-zinc-800 tabular-nums w-10 text-right">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function InspectorDrawer({
  job,
  onClose,
}: {
  job: RecoveryJob | null;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const isOpen = job !== null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay fixed inset-0 bg-black/20 z-40 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`drawer-panel fixed top-0 right-0 bottom-0 w-[520px] bg-white border-l border-zinc-200 shadow-xl z-50 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {job && (
          <>
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                  Inspector
                </p>
                <p className="font-mono text-sm font-medium text-zinc-800">
                  {job.payment.id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Section 1: Failure Details */}
              <div className="px-6 py-5 border-b border-zinc-100">
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">
                  Failure Details
                </h3>
                <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-4 space-y-0">
                  <KeyValue label="Amount" value={`INR ${formatINR(job.payment.amount)}`} mono />
                  <KeyValue label="Method" value={job.payment.method.toUpperCase()} mono />
                  <KeyValue label="Error Code" value={job.payment.errorCode} mono />
                  <KeyValue label="Error Reason" value={job.payment.errorReason} mono />
                  <div className="pt-2 mt-2 border-t border-zinc-200">
                    <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-zinc-600">{job.payment.errorDescription}</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-zinc-200">
                    <KeyValue label="Customer" value={job.payment.email} />
                    <KeyValue label="Contact" value={maskContact(job.payment.contact)} mono />
                    <KeyValue label="Order" value={job.payment.orderId} mono />
                  </div>
                </div>
              </div>

              {/* Section 2: AI Reasoning Chain */}
              <div className="px-6 py-5 border-b border-zinc-100">
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">
                  AI Reasoning Chain
                </h3>
                <div className="space-y-4">
                  {/* Root Cause */}
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Diagnosed Root Cause</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {job.recoveryAction.rootCause}
                    </span>
                  </div>

                  {/* Confidence */}
                  <div>
                    <p className="text-xs text-zinc-400 mb-2">Confidence Score</p>
                    <ConfidenceBar value={job.recoveryAction.confidence} />
                  </div>

                  {/* Reasoning */}
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Reasoning</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {job.recoveryAction.aiReasoning}
                    </p>
                  </div>

                  {/* Strategy */}
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Selected Strategy</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-zinc-900 text-zinc-100">
                      {job.recoveryAction.strategy}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Audit Log — Terminal Style */}
              <div className="px-6 py-5">
                <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">
                  Audit Log
                </h3>
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 overflow-x-auto">
                  <div className="font-mono text-xs leading-6 space-y-0">
                    {job.auditLogs.map((log) => (
                      <div key={log.id} className="flex">
                        <span className="text-zinc-600 select-none shrink-0">
                          {formatTimestamp(log.createdAt)}
                        </span>
                        <span className="text-zinc-500 mx-2 select-none shrink-0">|</span>
                        <span className={`shrink-0 w-[180px] ${
                          log.stage === "FUNDS_RECOVERED"
                            ? "text-emerald-400"
                            : log.stage === "ESCALATED"
                            ? "text-red-400"
                            : "text-zinc-400"
                        }`}>
                          {log.stage}
                        </span>
                        <span className="text-zinc-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
