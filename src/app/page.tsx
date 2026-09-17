"use client";

import Link from "next/link";

/* ─── tiny icon components (no external deps) ─── */

function CheckCircle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertTriangle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ShieldCheck({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function FileSearch({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="11.5" cy="14.5" r="2.5" />
      <line x1="13.25" y1="16.75" x2="15.5" y2="19" />
    </svg>
  );
}

function RotateCw({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

/* ─── journey steps for the visual ─── */

const journeySteps = [
  { label: "Submit", icon: "📄", status: "complete" as const },
  { label: "Evidence check", icon: "🔍", status: "complete" as const },
  { label: "Fix gaps", icon: "🔧", status: "active" as const },
  { label: "Review-ready", icon: "✅", status: "pending" as const },
];

/* ─── feature cards ─── */

const features = [
  {
    icon: <FileSearch className="w-6 h-6" />,
    title: "Evidence check",
    description: "Automated comparison of your documents against requirements. Know exactly what is present, missing, or mismatched.",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Clear explanations",
    description: "Every finding comes with a reason and a next action. No more guessing why your application is stuck.",
  },
  {
    icon: <RotateCw className="w-6 h-6" />,
    title: "Fix & re-check",
    description: "Upload missing documents, resolve mismatches, and re-check instantly — all in one place.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Human review stays human",
    description: "EvidenceFlow prepares your application for review. Final decisions are always made by a human reviewer.",
  },
];

/* ─── Page ─── */

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Evidence<span className="text-primary">Flow</span>
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 bg-gradient-to-b from-primary-light/40 via-white to-white">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-primary-light text-primary text-xs font-semibold rounded-full tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-ring" />
            Challenge C07
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            From unclear evidence
            <br />
            to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">review&#8209;ready</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary-light rounded-full -z-0" />
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            EvidenceFlow helps applicants understand exactly what is missing
            or inconsistent in their application — before human review.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Get started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 text-base font-semibold text-foreground bg-white hover:bg-surface border border-border rounded-xl transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* ─── JOURNEY VISUAL ─── */}
        <div className="mt-20 max-w-2xl w-full animate-fade-in-delay">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted mb-6">
            Your path to review-ready
          </p>
          <div className="flex items-center justify-between relative">
            {/* connector line */}
            <div className="absolute top-6 left-[12%] right-[12%] h-0.5 bg-border" />
            <div className="absolute top-6 left-[12%] h-0.5 bg-primary" style={{ width: "52%" }} />

            {journeySteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center relative z-10 w-1/4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm transition-all ${
                    step.status === "complete"
                      ? "bg-accent-light border-2 border-accent"
                      : step.status === "active"
                        ? "bg-warning-light border-2 border-warning animate-float"
                        : "bg-white border-2 border-border"
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`mt-3 text-xs font-medium ${
                    step.status === "active" ? "text-warning font-semibold" : step.status === "complete" ? "text-accent" : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM → SOLUTION ─── */}
      <section className="py-20 px-6 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <span className="text-red-500 text-lg">❓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Before EvidenceFlow</h3>
              <p className="text-muted leading-relaxed text-sm">
                &ldquo;Why is my application stuck? I uploaded everything but I have no idea what is wrong or what to do next.&rdquo;
              </p>
            </div>

            {/* After */}
            <div className="bg-white rounded-2xl p-8 border-2 border-primary shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-primary">With EvidenceFlow</h3>
              <p className="text-muted leading-relaxed text-sm">
                &ldquo;Here is exactly what is missing, why it matters, and what I need to do next.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-center text-muted mb-14 max-w-xl mx-auto">
            EvidenceFlow checks your application evidence against requirements and guides you to review-ready status.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-white border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE DEMO PREVIEW ─── */}
      <section className="py-16 px-6 bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">See it in action</h2>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Title bar */}
            <div className="px-6 py-4 border-b border-border bg-surface flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-muted font-medium">Evidence check — Learning Workshop A</span>
            </div>

            {/* Simulated evidence results */}
            <div className="p-6 space-y-3">
              {[
                { name: "Registration", status: "complete", icon: "✓" },
                { name: "Activity plan", status: "complete", icon: "✓" },
                { name: "Responsible-person signoff", status: "missing", icon: "!" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    item.status === "complete"
                      ? "border-accent/30 bg-accent-light/30"
                      : "border-warning/30 bg-warning-light/30"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.status === "complete" ? "bg-accent text-white" : "bg-warning text-white"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className={`text-xs ${item.status === "complete" ? "text-accent" : "text-warning"}`}>
                      {item.status === "complete" ? "Complete" : "Missing — action required"}
                    </p>
                  </div>
                </div>
              ))}

              {/* Next action */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Next best action</p>
                <div className="flex items-center gap-3 p-4 bg-primary-light/50 rounded-xl border border-primary/20">
                  <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm text-primary font-medium">
                    Upload the responsible-person signoff to proceed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-primary-light/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get review-ready?</h2>
          <p className="text-muted mb-8">
            Stop guessing. Start knowing exactly what your application needs.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            Get started free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="text-sm font-medium">
              Evidence<span className="text-primary">Flow</span>
            </span>
          </div>
          <p className="text-xs text-muted">
            Hackathon prototype — Challenge C07 · Synthetic exercise data only
          </p>
          <p className="text-xs text-muted">
            Final application decisions are made by human reviewers.
          </p>
        </div>
      </footer>
    </div>
  );
}
