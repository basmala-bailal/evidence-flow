"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getApplications,
  getStats,
  type Application,
} from "@/lib/application-store";
import { useEffect, useState } from "react";

/* ─── Status helpers ─── */

function statusLabel(s: Application["status"]) {
  switch (s) {
    case "draft":
      return "Draft";
    case "needs-attention":
      return "Needs attention";
    case "in-progress":
      return "In progress";
    case "review-ready":
      return "Review-ready";
  }
}

function statusColor(s: Application["status"]) {
  switch (s) {
    case "draft":
      return "bg-gray-100 text-gray-600 border-gray-200";
    case "needs-attention":
      return "bg-warning-light text-amber-700 border-warning/30";
    case "in-progress":
      return "bg-primary-light text-primary border-primary/30";
    case "review-ready":
      return "bg-accent-light text-emerald-700 border-accent/30";
  }
}

function progressColor(s: Application["status"]) {
  switch (s) {
    case "draft":
      return "bg-gray-300";
    case "needs-attention":
      return "bg-warning";
    case "in-progress":
      return "bg-primary";
    case "review-ready":
      return "bg-accent";
  }
}

/* ─── Icons ─── */

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function LogOutIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function FileTextIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ─── Page ─── */

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({ total: 0, needsAttention: 0, reviewReady: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setApplications(getApplications());
      setStats(getStats());
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

  const firstName = user.name.split(" ")[0];

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

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface rounded-full border border-border">
              <div className="w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <LogOutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Main ─── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {firstName}</h1>
          <p className="text-muted text-sm">
            Manage your applications and track their progress toward review-ready status.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Total applications</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Needs attention</p>
            <p className="text-2xl font-bold text-amber-600">{stats.needsAttention}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Review-ready</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.reviewReady}</p>
          </div>
        </div>

        {/* Header + create button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">My applications</h2>
          <Link
            href="/dashboard/new"
            className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            New application
          </Link>
        </div>

        {/* Application cards */}
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => {
              const completed = app.requirements.filter((r) => r.status === "satisfied").length;
              const total = app.requirements.length;
              return (
                <Link
                  key={app.id}
                  href={`/dashboard/application/${app.id}`}
                  className="group block bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                        <FileTextIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-semibold truncate">{app.organisation}</h3>
                          <span className={`shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusColor(app.status)}`}>
                            {statusLabel(app.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted mb-3">{app.activity}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${progressColor(app.status)}`}
                              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted whitespace-nowrap">
                            {completed} / {total} requirements
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted hidden sm:block">{app.updatedAt}</span>
                      <ChevronRightIcon className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <FileTextIcon className="w-12 h-12 text-muted/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">No applications yet</h3>
            <p className="text-muted text-sm mb-6">Create your first application to get started.</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              New application
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-4 px-6">
        <p className="text-xs text-center text-muted">
          Hackathon prototype — Challenge C07 · Final application decisions are made by human reviewers.
        </p>
      </footer>
    </div>
  );
}
