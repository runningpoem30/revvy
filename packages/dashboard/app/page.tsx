"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import MetricsRow from "@/components/metrics-row";
import RecoveryTable from "@/components/recovery-table";
import InspectorDrawer from "@/components/inspector-drawer";
import { RecoveryJob, MOCK_RECOVERY_JOBS } from "@/lib/mock-data";

export default function DashboardPage() {
  const [selectedJob, setSelectedJob] = useState<RecoveryJob | null>(null);
  const [jobs, setJobs] = useState<RecoveryJob[]>(MOCK_RECOVERY_JOBS);
  const [dataSource, setDataSource] = useState<"mock" | "database">("mock");
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/recovery-jobs");
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      if (data.jobs && data.jobs.length > 0) {
        // Real DB data available — use it, with mock data appended for demo completeness
        setJobs([...data.jobs, ...MOCK_RECOVERY_JOBS]);
        setDataSource("database");
      } else {
        // DB empty or unavailable — fall back to mock data only
        setJobs(MOCK_RECOVERY_JOBS);
        setDataSource("mock");
      }
    } catch {
      // API unreachable — use mock data
      setJobs(MOCK_RECOVERY_JOBS);
      setDataSource("mock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    // Poll every 10 seconds for new recovery jobs
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />

      {/* Main Content — offset by sidebar width */}
      <main className="ml-60 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          <Header />
          <MetricsRow jobs={jobs} />

          {/* Data source indicator */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
              dataSource === "database"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-zinc-100 text-zinc-500 border border-zinc-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                dataSource === "database" ? "bg-emerald-500" : "bg-zinc-400"
              }`} />
              {dataSource === "database" ? "Live Database" : "Mock Data"}
            </span>
            {loading && (
              <span className="text-xs text-zinc-400">Loading...</span>
            )}
          </div>

          <RecoveryTable jobs={jobs} onSelectJob={setSelectedJob} />
        </div>
      </main>

      {/* Inspector Drawer */}
      <InspectorDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
