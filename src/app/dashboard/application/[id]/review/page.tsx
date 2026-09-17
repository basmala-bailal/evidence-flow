"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getApplication,
  runEvidenceCheck,
  saveAnalysisResult,
  type Application,
  type Requirement,
  type RequirementStatus,
} from "@/lib/application-store";
import { useState, useEffect, useCallback, useRef } from "react";

/* ─── Icons ─── */

function ArrowLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
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

function AlertTriangleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
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

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ─── Status config ─── */

function statusConfig(s: RequirementStatus) {
  switch (s) {
    case "satisfied":
      return { icon: <CheckCircleIcon className="w-6 h-6" />, label: "Complete", color: "text-emerald-600", bg: "bg-accent-light", border: "border-accent/40", ring: "ring-accent/20" };
    case "missing":
      return { icon: <AlertTriangleIcon className="w-6 h-6" />, label: "Missing", color: "text-amber-600", bg: "bg-warning-light", border: "border-warning/40", ring: "ring-warning/20" };
    case "mismatch":
      return { icon: <AlertTriangleIcon className="w-6 h-6" />, label: "Mismatch", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-300", ring: "ring-orange-200" };
    case "pending":
      return { icon: <AlertTriangleIcon className="w-6 h-6" />, label: "Pending", color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", ring: "ring-gray-100" };
    case "checking":
      return { icon: <AlertTriangleIcon className="w-6 h-6" />, label: "Checking…", color: "text-primary", bg: "bg-primary-light", border: "border-primary/30", ring: "ring-primary/20" };
  }
}

function nextActionText(req: Requirement): string {
  if (req.status === "missing") return `Upload the ${req.label.toLowerCase()} to proceed.`;
  if (req.status === "mismatch") return `Clarification required — the organisation name in the document does not match the application.`;
  if (req.status === "pending") return `Upload the ${req.label.toLowerCase()}.`;
  return "";
}

function expectedEvidence(req: Requirement): string {
  switch (req.type) {
    case "registration": return "A valid registration document matching the declared organisation.";
    case "activity-plan": return "An activity plan describing the proposed programme.";
    case "responsible-person-signoff": return "A signed document from the named responsible person.";
  }
}

function evidenceFound(req: Requirement): string {
  if (!req.fileName) return "None";
  if (req.status === "mismatch") return `Document present (${req.fileName}), but contains a mismatch.`;
  return `${req.fileName}`;
}

function ruleReference(req: Requirement): string {
  if (req.status === "missing") return "RULE-1: Review-ready requires a registration record, activity plan and named responsible-person signoff.";
  if (req.status === "mismatch") return "RULE-2: A name mismatch requires clarification, never automatic rejection.";
  return "RULE-1: Review-ready requires a registration record, activity plan and named responsible-person signoff.";
}

/* ─── Page ─── */

type Phase = "idle" | "checking" | "done";

export default function ReviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [mounted, setMounted] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [uploadingReq, setUploadingReq] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadApp = useCallback(() => {
    const data = getApplication(appId);
    if (!data) { router.push("/dashboard"); return; }
    setApp(data);
    setMounted(true);
  }, [appId, router]);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (user) loadApp();
  }, [user, loading, router, loadApp]);

  // Auto-run check if the app hasn't been checked or the user just arrived
  useEffect(() => {
    if (!app || phase !== "idle") return;
    if (!app.checked) {
      handleCheck();
    } else {
      setPhase("done");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  const handleCheck = async () => {
    setPhase("checking");
    // Simulate a realistic checking delay
    await new Promise((r) => setTimeout(r, 2000));
    runEvidenceCheck(appId);
    loadApp();
    setPhase("done");
  };

  const handleUploadForReq = (req: Requirement) => {
    setUploadingReq(req.id);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (file: File) => {
    if (!uploadingReq || !app) return;
    const req = app.requirements.find((r) => r.id === uploadingReq);
    if (!req) return;

    // Show upload animation
    setPhase("checking");

    // Call the AI API
    const formData = new FormData();
    formData.append("file", file);
    formData.append("requirementType", req.type);
    formData.append("declaredOrganisation", app.organisation);
    formData.append("declaredActivity", app.activity);
    formData.append("declaredResponsiblePerson", app.responsiblePerson);

    try {
      const res = await fetch("/api/analyze-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        saveAnalysisResult(appId, req.type, file.name, data.status, data.documentValue);
      } else {
        console.error("AI Error:", data.error);
        alert(`AI Error: ${data.error}`);
        saveAnalysisResult(appId, req.type, file.name, "satisfied");
      }
    } catch (e) {
      console.error(e);
      saveAnalysisResult(appId, req.type, file.name, "satisfied");
    }

    loadApp();
    setPhase("done");
    setUploadingReq(null);
    setSelectedReq(null);
  };

  if (loading || !mounted || !app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-3 text-muted">
          <span className="w-5 h-5 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  const completed = app.requirements.filter((r) => r.status === "satisfied").length;
  const total = app.requirements.length;
  const allSatisfied = completed === total;
  const blocking = app.requirements.filter((r) => r.status === "missing" || r.status === "mismatch");
  const firstBlocking = blocking[0] || null;

  /* ═══════════════════════════════════════════
     CHECKING PHASE — animated transition
     ═══════════════════════════════════════════ */
  if (phase === "checking") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-light flex items-center justify-center">
            <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Checking your application…</h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            Comparing your documents against requirements. This will only take a moment.
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     REVIEW-READY STATE
     ═══════════════════════════════════════════ */
  if (phase === "done" && allSatisfied) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Evidence<span className="text-primary">Flow</span>
              </span>
            </Link>
          </div>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="text-center animate-fade-in max-w-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-light flex items-center justify-center">
              <ShieldCheckIcon className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold mb-3 text-emerald-700">Review-Ready</h1>
            <p className="text-muted mb-2">
              Your application contains the required evidence for human review.
            </p>
            <div className="mt-6 p-4 bg-white rounded-xl border border-border text-sm text-muted">
              <p className="font-medium text-foreground mb-1">Important</p>
              <p>
                This does <strong>not</strong> mean your application has been approved.
                Final application decisions remain with the human reviewer.
              </p>
            </div>

            {/* Requirements summary */}
            <div className="mt-8 space-y-2">
              {app.requirements.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 bg-accent-light/50 rounded-lg border border-accent/20">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium text-emerald-800">{req.label}</span>
                  <span className="ml-auto text-xs text-emerald-600">Complete</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href={`/dashboard/application/${app.id}`}
                className="px-5 py-2.5 text-sm font-medium text-muted hover:text-foreground border border-border rounded-lg transition-colors"
              >
                Back to application
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RESULTS VIEW — "Your Path to Review-Ready"
     ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Evidence<span className="text-primary">Flow</span>
            </span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        {/* Back */}
        <Link
          href={`/dashboard/application/${app.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to application
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
            {app.organisation} · {app.id}
          </p>
          <h1 className="text-2xl font-bold mb-2">Your Path to Review-Ready</h1>
          <p className="text-muted text-sm">
            {completed} of {total} requirements satisfied
          </p>
          {/* Progress bar */}
          <div className="max-w-sm mx-auto mt-4">
            <div className="h-2.5 bg-white rounded-full overflow-hidden border border-border">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─── Requirement cards ─── */}
        <div className="space-y-3 mb-10">
          {app.requirements.map((req) => {
            const cfg = statusConfig(req.status);
            const isBlocking = req.status === "missing" || req.status === "mismatch";

            return (
              <button
                key={req.id}
                onClick={() => isBlocking ? setSelectedReq(req) : null}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${cfg.border} ${cfg.bg} ${
                  isBlocking ? "cursor-pointer hover:ring-2 " + cfg.ring : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`shrink-0 ${cfg.color}`}>{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{req.label}</h3>
                    <p className={`text-xs font-medium mt-0.5 ${cfg.color}`}>{cfg.label}</p>
                  </div>
                  {isBlocking && (
                    <div className="flex items-center gap-1 text-xs font-medium text-muted">
                      View details
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {req.status === "satisfied" && (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── Next best action ─── */}
        {firstBlocking && (
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Next best action</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                <ArrowRightIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{nextActionText(firstBlocking)}</p>
                {firstBlocking.status === "missing" && (
                  <button
                    onClick={() => handleUploadForReq(firstBlocking)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                  >
                    <UploadIcon className="w-4 h-4" />
                    Upload {firstBlocking.label.toLowerCase()}
                  </button>
                )}
                {firstBlocking.status === "mismatch" && (
                  <button
                    onClick={() => setSelectedReq(firstBlocking)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
                  >
                    View mismatch details
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Re-check button */}
        <div className="flex justify-center">
          <button
            onClick={handleCheck}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            Re-check my application
          </button>
        </div>

        {/* Human reviewer note */}
        <p className="text-xs text-center text-muted mt-8">
          Final application decisions are made by a human reviewer. This check only determines
          whether the required evidence is present.
        </p>
      </main>

      {/* ═══════════════════════════════════════
          EVIDENCE LENS — Side panel / modal
          ═══════════════════════════════════════ */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedReq(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">Evidence Lens</h2>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1.5 rounded-lg hover:bg-surface transition-colors text-muted hover:text-foreground"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Requirement */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Requirement</p>
                <p className="text-sm font-medium">{selectedReq.label}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedReq.status === "missing"
                    ? "bg-warning-light text-amber-700"
                    : selectedReq.status === "mismatch"
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "bg-accent-light text-emerald-700"
                }`}>
                  {statusConfig(selectedReq.status).icon}
                  {statusConfig(selectedReq.status).label}
                </span>
              </div>

              {/* Expected evidence */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Expected evidence</p>
                <p className="text-sm">{expectedEvidence(selectedReq)}</p>
              </div>

              {/* Evidence found */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Evidence found</p>
                <p className={`text-sm ${!selectedReq.fileName ? "text-amber-600 italic" : ""}`}>
                  {evidenceFound(selectedReq)}
                </p>
              </div>

              {/* Mismatch detail */}
              {selectedReq.status === "mismatch" && selectedReq.declaredValue && selectedReq.documentValue && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Mismatch detail</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-orange-500 mb-0.5">Declared organisation</p>
                      <p className="text-sm font-medium text-orange-900 bg-white px-3 py-2 rounded-lg border border-orange-200">
                        {selectedReq.declaredValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-500 mb-0.5">Document organisation</p>
                      <p className="text-sm font-medium text-orange-900 bg-white px-3 py-2 rounded-lg border border-orange-200">
                        {selectedReq.documentValue}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start p-3 bg-white rounded-lg border border-orange-200">
                    <span className="text-orange-500 shrink-0 mt-0.5">ℹ</span>
                    <p className="text-xs text-orange-700">
                      A mismatch does <strong>not</strong> mean rejection. It means a clarification
                      is required. A human reviewer will assess the situation.
                    </p>
                  </div>
                </div>
              )}

              {/* Rule reference */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Rule reference</p>
                <p className="text-xs text-muted bg-surface p-3 rounded-lg border border-border font-mono">
                  {ruleReference(selectedReq)}
                </p>
              </div>

              {/* Next action */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">Next action</p>
                <p className="text-sm font-medium">{nextActionText(selectedReq)}</p>
              </div>

              {/* Action button */}
              {selectedReq.status === "missing" && (
                <button
                  onClick={() => handleUploadForReq(selectedReq)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                >
                  <UploadIcon className="w-4 h-4" />
                  Upload {selectedReq.label.toLowerCase()}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
