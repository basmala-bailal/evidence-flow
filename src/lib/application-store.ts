"use client";

/* ─────────────────────────────────────────────
   Application Store  (localStorage-backed)
   Manages applications, documents, and evidence
   status for the hackathon prototype.
   ───────────────────────────────────────────── */

/* ─── Types ─── */

export type RequirementStatus =
  | "satisfied"
  | "missing"
  | "mismatch"
  | "pending"
  | "checking";

export interface Requirement {
  id: string;
  label: string;
  type: "registration" | "activity-plan" | "responsible-person-signoff";
  status: RequirementStatus;
  fileName?: string;
  uploadedAt?: string;
  /** For mismatch: value declared in application */
  declaredValue?: string;
  /** For mismatch: value found in document */
  documentValue?: string;
}

export interface Application {
  id: string;
  organisation: string;
  activity: string;
  responsiblePerson: string;
  description: string;
  status: "draft" | "needs-attention" | "in-progress" | "review-ready";
  requirements: Requirement[];
  createdAt: string;
  updatedAt: string;
  checked: boolean;
  decision?: "approved" | "clarification-requested";
  decisionNotes?: string;
}

/* ─── Seed data (from initial.json) ─── */

const SEED_APPLICATIONS: Application[] = [
  {
    id: "APP-1",
    organisation: "Learning Workshop A",
    activity: "Vocational pilot",
    responsiblePerson: "Dr. Eva Schmidt",
    description:
      "A vocational pilot programme aimed at providing hands-on training in modern manufacturing techniques for young professionals.",
    status: "needs-attention",
    checked: true,
    requirements: [
      {
        id: "REG-1",
        label: "Registration",
        type: "registration",
        status: "satisfied",
        fileName: "registration_LWA.pdf",
        uploadedAt: "2 days ago",
      },
      {
        id: "PLAN-1",
        label: "Activity plan",
        type: "activity-plan",
        status: "satisfied",
        fileName: "activity_plan_vocational.pdf",
        uploadedAt: "2 days ago",
      },
      {
        id: "CONSENT-1",
        label: "Responsible-person signoff",
        type: "responsible-person-signoff",
        status: "missing",
      },
    ],
    createdAt: "3 days ago",
    updatedAt: "2 hours ago",
  },
  {
    id: "APP-2",
    organisation: "Community Workshop B",
    activity: "Trainer development",
    responsiblePerson: "Prof. Thomas Klein",
    description:
      "A trainer development initiative focused on upskilling community educators in digital literacy and modern pedagogy.",
    status: "needs-attention",
    checked: true,
    requirements: [
      {
        id: "REG-2",
        label: "Registration",
        type: "registration",
        status: "mismatch",
        fileName: "registration_CWC.pdf",
        uploadedAt: "1 day ago",
        declaredValue: "Community Workshop B",
        documentValue: "Community Workshop C",
      },
      {
        id: "PLAN-2",
        label: "Activity plan",
        type: "activity-plan",
        status: "missing",
      },
      {
        id: "CONSENT-2",
        label: "Responsible-person signoff",
        type: "responsible-person-signoff",
        status: "missing",
      },
    ],
    createdAt: "5 days ago",
    updatedAt: "1 day ago",
  },
];

/* ─── Store helpers ─── */

const STORAGE_KEY = "ef_applications";

function read(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Application[];
  } catch {
    /* ignore */
  }
  // First load: seed with demo data
  write(SEED_APPLICATIONS);
  return SEED_APPLICATIONS;
}

function write(apps: Application[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

/* ─── Public API ─── */

export function getApplications(): Application[] {
  return read();
}

export function getApplication(id: string): Application | undefined {
  return read().find((a) => a.id === id);
}

export function createApplication(
  data: Pick<Application, "organisation" | "activity" | "responsiblePerson" | "description">
): Application {
  const apps = read();
  const newApp: Application = {
    id: `APP-${Date.now()}`,
    ...data,
    status: "draft",
    checked: false,
    requirements: [
      {
        id: `REQ-${Date.now()}-1`,
        label: "Registration",
        type: "registration",
        status: "pending",
      },
      {
        id: `REQ-${Date.now()}-2`,
        label: "Activity plan",
        type: "activity-plan",
        status: "pending",
      },
      {
        id: `REQ-${Date.now()}-3`,
        label: "Responsible-person signoff",
        type: "responsible-person-signoff",
        status: "pending",
      },
    ],
    createdAt: "Just now",
    updatedAt: "Just now",
  };
  apps.push(newApp);
  write(apps);
  return newApp;
}

export function updateApplication(
  id: string,
  data: Partial<Pick<Application, "organisation" | "activity" | "responsiblePerson" | "description">>
): Application | undefined {
  const apps = read();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  apps[idx] = { ...apps[idx], ...data, updatedAt: "Just now" };
  write(apps);
  return apps[idx];
}

export function uploadDocument(
  appId: string,
  requirementType: Requirement["type"],
  fileName: string
): Application | undefined {
  const apps = read();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx === -1) return undefined;

  const req = apps[idx].requirements.find((r) => r.type === requirementType);
  if (!req) return undefined;

  req.fileName = fileName;
  req.uploadedAt = "Just now";

  // If it was missing → mark as pending (waiting for check)
  if (req.status === "missing" || req.status === "pending") {
    req.status = "pending";
  }

  apps[idx].updatedAt = "Just now";
  write(apps);
  return apps[idx];
}

export function removeDocument(
  appId: string,
  requirementType: Requirement["type"]
): Application | undefined {
  const apps = read();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx === -1) return undefined;

  const req = apps[idx].requirements.find((r) => r.type === requirementType);
  if (!req) return undefined;

  req.fileName = undefined;
  req.uploadedAt = undefined;
  req.status = "pending";

  apps[idx].updatedAt = "Just now";
  write(apps);
  return apps[idx];
}

/** Simulate the evidence check: deterministic logic, no LLM needed for prototype */
export function saveAnalysisResult(
  appId: string,
  requirementType: Requirement["type"],
  fileName: string,
  status: RequirementStatus,
  documentValue?: string
): Application | undefined {
  const apps = read();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx === -1) return undefined;

  const app = apps[idx];
  const req = app.requirements.find((r) => r.type === requirementType);
  if (!req) return undefined;

  req.fileName = fileName;
  req.uploadedAt = "Just now";
  req.status = status;
  if (documentValue) {
    req.documentValue = documentValue;
  }

  // Derive app-level status
  const allSatisfied = app.requirements.every((r) => r.status === "satisfied");
  const hasMissing = app.requirements.some((r) => r.status === "missing");
  const hasMismatch = app.requirements.some((r) => r.status === "mismatch");

  if (allSatisfied) {
    app.status = "review-ready";
  } else if (hasMissing || hasMismatch) {
    app.status = "needs-attention";
  } else {
    app.status = "in-progress";
  }

  app.checked = true;
  app.updatedAt = "Just now";
  write(apps);
  return apps[idx];
}

/** Legacy simulated check (now only updates app status if not using real AI) */
export function runEvidenceCheck(appId: string): Application | undefined {
  const apps = read();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx === -1) return undefined;

  const app = apps[idx];

  // Derive app-level status based on already-saved AI results
  const allSatisfied = app.requirements.every((r) => r.status === "satisfied");
  const hasMissing = app.requirements.some((r) => r.status === "missing" || !r.fileName);
  const hasMismatch = app.requirements.some((r) => r.status === "mismatch");

  if (allSatisfied) {
    app.status = "review-ready";
  } else if (hasMissing || hasMismatch) {
    app.status = "needs-attention";
  } else {
    app.status = "in-progress";
  }

  app.checked = true;
  app.updatedAt = "Just now";
  write(apps);
  return apps[idx];
}

/** Compute summary stats */
export function getStats() {
  const apps = read();
  return {
    total: apps.length,
    needsAttention: apps.filter((a) => a.status === "needs-attention").length,
    reviewReady: apps.filter((a) => a.status === "review-ready").length,
  };
}

export function recordCaseworkerDecision(
  appId: string,
  decision: "approved" | "clarification-requested",
  notes: string
): Application | undefined {
  const apps = read();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx === -1) return undefined;
  apps[idx].decision = decision;
  apps[idx].decisionNotes = notes;
  apps[idx].updatedAt = "Just now";
  write(apps);
  return apps[idx];
}

/** Reset to seed data (for demo) */
export function resetStore() {
  write(SEED_APPLICATIONS);
}
