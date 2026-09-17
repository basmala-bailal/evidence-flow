"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getApplication,
  updateApplication,
  saveAnalysisResult,
  removeDocument,
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

function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function FileIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ─── Status rendering ─── */

function reqStatusConfig(s: RequirementStatus) {
  switch (s) {
    case "satisfied":
      return {
        icon: <CheckCircleIcon className="w-5 h-5" />,
        label: "Complete",
        color: "text-emerald-600",
        bg: "bg-accent-light/50 border-accent/30",
        dot: "bg-accent",
      };
    case "missing":
      return {
        icon: <AlertTriangleIcon className="w-5 h-5" />,
        label: "Missing",
        color: "text-amber-600",
        bg: "bg-warning-light/50 border-warning/30",
        dot: "bg-warning",
      };
    case "mismatch":
      return {
        icon: <AlertTriangleIcon className="w-5 h-5" />,
        label: "Mismatch — clarification required",
        color: "text-orange-600",
        bg: "bg-orange-50 border-orange-200",
        dot: "bg-orange-400",
      };
    case "pending":
      return {
        icon: <ClockIcon className="w-5 h-5" />,
        label: "Pending upload",
        color: "text-muted",
        bg: "bg-gray-50 border-gray-200",
        dot: "bg-gray-300",
      };
    case "checking":
      return {
        icon: <ClockIcon className="w-5 h-5" />,
        label: "Checking…",
        color: "text-primary",
        bg: "bg-primary-light/50 border-primary/30",
        dot: "bg-primary",
      };
  }
}

/* ─── Tabs ─── */

type Tab = "details" | "documents";

/* ─── Page ─── */

export default function ApplicationDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [tab, setTab] = useState<Tab>("details");
  const [mounted, setMounted] = useState(false);

  // Form state (details tab)
  const [org, setOrg] = useState("");
  const [activity, setActivity] = useState("");
  const [responsible, setResponsible] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadApp = useCallback(() => {
    const data = getApplication(appId);
    if (!data) {
      router.push("/dashboard");
      return;
    }
    setApp(data);
    setOrg(data.organisation);
    setActivity(data.activity);
    setResponsible(data.responsiblePerson);
    setDesc(data.description);
    setMounted(true);
  }, [appId, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadApp();
  }, [user, loading, router, loadApp]);

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

  /* ─ Save details ─ */
  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateApplication(appId, {
      organisation: org.trim(),
      activity: activity.trim(),
      responsiblePerson: responsible.trim(),
      description: desc.trim(),
    });
    loadApp();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ─ Upload handler ─ */
  const handleUpload = async (req: Requirement, file: File) => {
    if (!app) return;

    // Fast feedback (optimistic update optional, but let's wait for real AI)
    saveAnalysisResult(appId, req.type, file.name, "checking");
    loadApp();

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
        saveAnalysisResult(appId, req.type, file.name, "pending");
      }
    } catch (e) {
      console.error(e);
      saveAnalysisResult(appId, req.type, file.name, "pending");
    }

    loadApp();
  };

  /* ─ Remove handler ─ */
  const handleRemove = (req: Requirement) => {
    removeDocument(appId, req.type);
    loadApp();
  };

  const completed = app.requirements.filter((r) => r.status === "satisfied").length;
  const total = app.requirements.length;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">{app.organisation}</h1>
            <p className="text-muted text-sm">{app.activity} · {app.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-muted">
              {completed}/{total} requirements
            </div>
            <Link
              href={`/dashboard/application/${app.id}/review`}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              Check my application
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          <button
            onClick={() => setTab("details")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Application details
          </button>
          <button
            onClick={() => setTab("documents")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "documents"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Documents
          </button>
        </div>

        {/* ═══════ DETAILS TAB ═══════ */}
        {tab === "details" && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
            <div>
              <label htmlFor="org" className="block text-sm font-medium mb-1.5">Organisation name</label>
              <input
                id="org" type="text" value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="act" className="block text-sm font-medium mb-1.5">Requested activity</label>
              <input
                id="act" type="text" value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="resp" className="block text-sm font-medium mb-1.5">Responsible person</label>
              <input
                id="resp" type="text" value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="desc" className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                id="desc" value={desc} rows={4}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              {saved && (
                <span className="text-sm text-accent flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" /> Saved
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══════ DOCUMENTS TAB ═══════ */}
        {tab === "documents" && (
          <div className="space-y-4">
            <p className="text-sm text-muted mb-2">
              Upload your supporting documents. Each requirement needs a corresponding document to proceed.
            </p>

            {app.requirements.map((req) => {
              const cfg = reqStatusConfig(req.status);
              const hasFile = !!req.fileName;

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden ${cfg.bg}`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: status + info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                          {cfg.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm mb-0.5">{req.label}</h3>
                          <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>

                          {/* Uploaded file */}
                          {hasFile && (
                            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-border w-fit">
                              <FileIcon className="w-4 h-4 text-muted shrink-0" />
                              <span className="text-xs text-foreground font-medium truncate max-w-[200px]">
                                {req.fileName}
                              </span>
                              {req.uploadedAt && (
                                <span className="text-xs text-muted">· {req.uploadedAt}</span>
                              )}
                            </div>
                          )}

                          {/* Mismatch detail */}
                          {req.status === "mismatch" && req.declaredValue && req.documentValue && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200 text-xs space-y-1">
                              <p>
                                <span className="font-medium text-orange-700">Declared:</span>{" "}
                                <span className="text-orange-900">{req.declaredValue}</span>
                              </p>
                              <p>
                                <span className="font-medium text-orange-700">In document:</span>{" "}
                                <span className="text-orange-900">{req.documentValue}</span>
                              </p>
                              <p className="text-orange-600 mt-1">
                                A mismatch requires clarification — it does not mean rejection.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {hasFile && (
                          <button
                            onClick={() => handleRemove(req)}
                            className="p-2 text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Remove document"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => fileInputRefs.current[req.id]?.click()}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                            hasFile
                              ? "text-muted bg-surface hover:bg-gray-100 border border-border"
                              : "text-white bg-primary hover:bg-primary-dark"
                          }`}
                        >
                          <UploadIcon className="w-3.5 h-3.5" />
                          {hasFile ? "Replace" : "Upload"}
                        </button>
                        {/* Hidden file input */}
                        <input
                          ref={(el) => { fileInputRefs.current[req.id] = el; }}
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(req, file);
                            e.target.value = "";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Check CTA */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-muted">
                {app.requirements.filter((r) => !!r.fileName).length} of {app.requirements.length} documents uploaded
              </p>
              <Link
                href={`/dashboard/application/${app.id}/review`}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
              >
                Check my application →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
