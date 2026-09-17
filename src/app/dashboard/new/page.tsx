"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createApplication } from "@/lib/application-store";
import { useState, useEffect } from "react";

function ArrowLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export default function NewApplicationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [organisation, setOrganisation] = useState("");
  const [activity, setActivity] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!organisation.trim() || !activity.trim()) {
      setError("Organisation name and requested activity are required.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500)); // simulate

    const app = createApplication({
      organisation: organisation.trim(),
      activity: activity.trim(),
      responsiblePerson: responsiblePerson.trim(),
      description: description.trim(),
    });

    router.push(`/dashboard/application/${app.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navbar */}
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

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Create new application</h1>
          <p className="text-muted text-sm">
            Fill in the basic details for your application. You can upload documents in the next step.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
            {/* Organisation */}
            <div>
              <label htmlFor="org" className="block text-sm font-medium mb-1.5">
                Organisation name <span className="text-red-400">*</span>
              </label>
              <input
                id="org"
                type="text"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                placeholder="e.g. Learning Workshop A"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Activity */}
            <div>
              <label htmlFor="activity" className="block text-sm font-medium mb-1.5">
                Requested activity <span className="text-red-400">*</span>
              </label>
              <input
                id="activity"
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g. Vocational pilot"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Responsible person */}
            <div>
              <label htmlFor="responsible" className="block text-sm font-medium mb-1.5">
                Responsible person
              </label>
              <input
                id="responsible"
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder="e.g. Dr. Eva Schmidt"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="desc" className="block text-sm font-medium mb-1.5">
                Application description
              </label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Briefly describe the purpose and goals of this application…"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>

          {/* Info box */}
          <div className="flex gap-3 p-4 bg-primary-light/50 rounded-xl border border-primary/20">
            <span className="text-primary text-lg shrink-0">ℹ</span>
            <p className="text-sm text-primary/80">
              After creating the application you will be able to upload your supporting documents
              and check your evidence against requirements.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                "Create application"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
