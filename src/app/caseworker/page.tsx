"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getApplications,
  recordCaseworkerDecision,
  type Application,
  type Requirement,
} from "@/lib/application-store";
import { useEffect, useState } from "react";

/* ─── Icons ─── */

function LogOutIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function FileTextIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function CheckCircleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function CaseworkerDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [mounted, setMounted] = useState(false);

  // Modals state
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [decidingApp, setDecidingApp] = useState<Application | null>(null);
  const [decisionType, setDecisionType] = useState<"approved" | "clarification-requested">("approved");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"queue" | "decided">("queue");

  const refreshApplications = () => {
    const allApps = getApplications();
    setApplications(allApps.filter((a) => a.status === "review-ready"));
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user && user.role !== "caseworker") {
      router.push("/dashboard");
      return;
    }
    if (user) {
      refreshApplications();
      setMounted(true);
    }
  }, [user, loading, router]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-3 text-muted">
          <span className="w-5 h-5 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (!user) return null;

  const pendingApps = applications.filter((a) => !a.decision);
  const decidedApps = applications.filter((a) => !!a.decision);
  const displayedApps = activeTab === "queue" ? pendingApps : decidedApps;

  const handleConfirmDecision = () => {
    if (!decidingApp) return;
    recordCaseworkerDecision(decidingApp.id, decisionType, notes);
    refreshApplications();
    setDecidingApp(null);
    setNotes("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Evidence<span className="text-emerald-400">Flow</span>
            </span>
            <span className="ml-4 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              Caseworker Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <LogOutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Caseworker Decision Queue</h1>
            <p className="text-muted text-sm">
              Applications here have satisfied automated evidence checks and are awaiting human decision.
            </p>
          </div>

          {/* Queue Filter Tabs */}
          <div className="flex bg-white rounded-lg border border-border p-1 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab("queue")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "queue"
                  ? "bg-slate-900 text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Pending Decision ({pendingApps.length})
            </button>
            <button
              onClick={() => setActiveTab("decided")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "decided"
                  ? "bg-slate-900 text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Decided ({decidedApps.length})
            </button>
          </div>
        </div>

        {/* List of Applications */}
        {displayedApps.length > 0 ? (
          <div className="space-y-4">
            {displayedApps.map((app) => (
              <div
                key={app.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-border hover:shadow-md transition-all p-6"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{app.organisation}</h3>
                      {app.decision === "approved" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                          Approved
                        </span>
                      )}
                      {app.decision === "clarification-requested" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold">
                          Clarification Requested
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted mb-2">{app.activity} · Lead: {app.responsiblePerson}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
                      <span className="px-2 py-1 bg-surface rounded-md border border-border">ID: {app.id}</span>
                      <span>Evidence: 3/3 Satisfied</span>
                      <span>· Updated: {app.updatedAt}</span>
                    </div>

                    {app.decisionNotes && (
                      <div className="mt-3 p-2.5 bg-surface rounded-lg border border-border text-xs text-muted">
                        <span className="font-semibold text-foreground">Caseworker Note:</span> {app.decisionNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setViewingApp(app)}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-surface hover:bg-gray-100 border border-border rounded-lg transition-colors"
                  >
                    View Documents
                  </button>
                  {!app.decision ? (
                    <button
                      onClick={() => {
                        setDecidingApp(app);
                        setDecisionType("approved");
                        setNotes("");
                      }}
                      className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                    >
                      Make Decision
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setDecidingApp(app);
                        setDecisionType(app.decision || "approved");
                        setNotes(app.decisionNotes || "");
                      }}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 bg-surface hover:bg-gray-100 border border-border rounded-lg transition-colors"
                    >
                      Edit Decision
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-border border-dashed">
            <ShieldCheckIcon className="w-12 h-12 text-muted/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">
              {activeTab === "queue" ? "No applications pending decision" : "No decided applications yet"}
            </h3>
            <p className="text-muted text-sm">
              {activeTab === "queue"
                ? "Applications will appear here once all required evidence is checked and marked review-ready."
                : "Decisions you record will be archived under this tab."}
            </p>
          </div>
        )}
      </main>

      {/* ─── MODAL 1: VIEW DOCUMENTS ─── */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
              <div>
                <h3 className="font-bold text-lg">{viewingApp.organisation}</h3>
                <p className="text-xs text-muted">Application ID: {viewingApp.id} · Verified Evidence Portfolio</p>
              </div>
              <button
                onClick={() => setViewingApp(null)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-gray-100"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1 mb-2">
                <p><span className="font-semibold">Declared Activity:</span> {viewingApp.activity}</p>
                <p><span className="font-semibold">Declared Responsible Person:</span> {viewingApp.responsiblePerson}</p>
                {viewingApp.description && (
                  <p><span className="font-semibold">Summary:</span> {viewingApp.description}</p>
                )}
              </div>

              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted pt-2">Submitted Supporting Documents</h4>

              <div className="space-y-3">
                {viewingApp.requirements.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{req.label}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <FileTextIcon className="w-4 h-4 text-muted" />
                            <span className="text-xs font-medium text-slate-700">{req.fileName || "Uploaded Document"}</span>
                            {req.uploadedAt && <span className="text-xs text-muted">({req.uploadedAt})</span>}
                          </div>
                          {req.documentValue && (
                            <p className="text-xs text-emerald-800 mt-2 bg-white px-2.5 py-1 rounded border border-emerald-200 inline-block">
                              <span className="font-semibold">Verified content:</span> {req.documentValue}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        Satisfied
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end bg-surface">
              <button
                onClick={() => setViewingApp(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-gray-100 border border-border rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: MAKE DECISION ─── */}
      {decidingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
              <div>
                <h3 className="font-bold text-lg">Record Caseworker Decision</h3>
                <p className="text-xs text-muted">{decidingApp.organisation} ({decidingApp.id})</p>
              </div>
              <button
                onClick={() => setDecidingApp(null)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-gray-100"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Final Decision
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    decisionType === "approved"
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-border hover:bg-surface"
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={decisionType === "approved"}
                      onChange={() => setDecisionType("approved")}
                      className="accent-emerald-600 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-semibold text-foreground">Approve Application for Grant</span>
                      <p className="text-xs text-muted">All statutory requirements and evidence are satisfied.</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    decisionType === "clarification-requested"
                      ? "border-amber-500 bg-amber-50/50"
                      : "border-border hover:bg-surface"
                  }`}>
                    <input
                      type="radio"
                      name="decision"
                      value="clarification-requested"
                      checked={decisionType === "clarification-requested"}
                      onChange={() => setDecisionType("clarification-requested")}
                      className="accent-amber-600 w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-semibold text-foreground">Request Further Clarification</span>
                      <p className="text-xs text-muted">Applicant must provide additional context before approval.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="caseworker-notes" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Reviewer Notes (Recorded on Audit Trail)
                </label>
                <textarea
                  id="caseworker-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Verified registration document matches registry; approved for vocational funding."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-surface">
              <button
                onClick={() => setDecidingApp(null)}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
