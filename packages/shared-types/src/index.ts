// ─── RBAC Roles & Permissions ────────────────────────────────
export type UserRole = "officer" | "senior_officer" | "admin" | "bidder";

export interface Permission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete" | "execute")[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  officer: [
    { resource: "tenders", actions: ["read", "create"] },
    { resource: "documents", actions: ["read", "create"] },
    { resource: "evaluation", actions: ["read", "execute"] },
    { resource: "review", actions: ["read", "update"] },
    { resource: "credibility", actions: ["read", "execute"] },
    { resource: "notification", actions: ["read", "execute"] },
    { resource: "dashboard", actions: ["read"] },
    { resource: "export", actions: ["read", "execute"] },
  ],
  senior_officer: [
    { resource: "tenders", actions: ["read", "create", "update", "delete"] },
    { resource: "documents", actions: ["read", "create", "delete"] },
    { resource: "evaluation", actions: ["read", "execute"] },
    { resource: "review", actions: ["read", "update", "execute"] },
    { resource: "credibility", actions: ["read", "execute"] },
    { resource: "notification", actions: ["read", "execute"] },
    { resource: "dashboard", actions: ["read"] },
    { resource: "export", actions: ["read", "execute"] },
    { resource: "signoff", actions: ["execute"] },
    { resource: "users", actions: ["read"] },
  ],
  admin: [
    { resource: "tenders", actions: ["read", "create", "update", "delete"] },
    { resource: "documents", actions: ["read", "create", "update", "delete"] },
    { resource: "evaluation", actions: ["read", "execute"] },
    { resource: "review", actions: ["read", "update", "execute"] },
    { resource: "credibility", actions: ["read", "execute"] },
    { resource: "notification", actions: ["read", "execute"] },
    { resource: "dashboard", actions: ["read"] },
    { resource: "export", actions: ["read", "execute"] },
    { resource: "signoff", actions: ["execute"] },
    { resource: "users", actions: ["read", "create", "update", "delete"] },
    { resource: "audit", actions: ["read"] },
  ],
  bidder: [
    { resource: "tenders", actions: ["read"] },
    { resource: "documents", actions: ["read", "create"] },
    { resource: "submissions", actions: ["read", "create", "update"] },
    { resource: "verdicts", actions: ["read"] },
    { resource: "notifications", actions: ["read"] },
    { resource: "profile", actions: ["read", "update"] },
  ],
};

export function hasPermission(
  role: UserRole,
  resource: string,
  action: "create" | "read" | "update" | "delete" | "execute"
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.some(
    (p) => p.resource === resource && p.actions.includes(action)
  );
}

// ─── Auth Types ──────────────────────────────────────────────
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  avatarUrl?: string;
  departmentId?: string;
}

export interface AuthTokenPayload {
  uid: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  iat: number;
  exp: number;
}

// ─── Tender Types ────────────────────────────────────────────
export interface Tender {
  tender_id: string;
  department_id: string;
  status: string;
  lifecycle_status?: "processing" | "active" | "inactive" | "completed" | "error";
  selected_bidder_id?: string | null;
  bidder_count: number;
  anomaly_count: number;
  critical_anomalies: number;
  created_at: string | null;
  title?: string;
  description?: string;
}

export interface TenderCriterion {
  criterion_id: string;
  tender_id: string;
  department_id: string;
  type: "financial" | "technical" | "compliance" | "documentation";
  description: string;
  threshold_value: string | null;
  threshold_unit: string | null;
  mandatory: boolean;
  raw_text_snippet?: string;
  page_reference?: number;
}

// ─── Document Types ──────────────────────────────────────────
export interface Document {
  id: string;
  tender_id: string;
  bidder_id: string | null;
  department_id: string;
  doc_type: "tender" | "bidder";
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentAuthenticity {
  document_id: string;
  authenticity_score: number;
  flags: Record<string, unknown> | null;
  scored_at: string;
}

// ─── Evaluation Types ────────────────────────────────────────
export interface EvaluationVerdict {
  verdict_id: string;
  tender_id: string;
  bidder_id: string;
  criterion_id: string;
  verdict: "ELIGIBLE" | "NOT_ELIGIBLE" | "MANUAL_REVIEW";
  confidence_score: number;
  evidence_document_id: string | null;
  source_page: number | null;
  extracted_value: string | null;
  threshold_value: string | null;
  ambiguity_reason: string | null;
  reasoning_trace: Record<string, unknown> | null;
}

export interface BidderOverallVerdict {
  bidder_id: string;
  overall_verdict: string;
  failing_criteria: string[] | null;
  manual_review_criteria: string[] | null;
  criteria_verdicts: EvaluationVerdict[];
}

export interface EvaluationResults {
  tender_id: string;
  bidders: BidderOverallVerdict[];
  total_bidders: number;
  total_criteria: number;
  criteria: { criterion_id: string; description: string; type: string }[];
}

// ─── Anomaly Types ───────────────────────────────────────────
export interface TenderAnomaly {
  id: string;
  anomaly_type: string;
  bidder_ids: string[] | null;
  evidence: Record<string, unknown> | null;
  severity: "critical" | "warning" | "info";
  detected_at: string | null;
}

export interface TenderContradiction {
  id: string;
  tender_id: string;
  criterion_ids: string[] | null;
  description: string;
  contradiction_type: string;
  severity: "warning" | "error";
  suggested_resolution: string | null;
  detected_at: string;
}

// ─── Dashboard Types ─────────────────────────────────────────
export interface DashboardSummary {
  active_tenders: number;
  pending_review_count: number;
  recent_activity: OfficerActivity[];
}

export interface OfficerActivity {
  id: string;
  action_type: string;
  target_id: string;
  comment: string | null;
  timestamp: string | null;
}

// ─── Bidder-specific Types ───────────────────────────────────
export interface BidderSubmission {
  id: string;
  tender_id: string;
  bidder_id: string;
  documents: Document[];
  status: "draft" | "submitted" | "under_review" | "evaluated";
  submitted_at: string | null;
}

export interface ProposalStatus {
  bidder_id: string;
  tender_id?: string;
  status: "pending" | "under_evaluation" | "requires_human_review" | "evaluated" | "accepted" | "rejected";
  document_count: number;
  updated_at: string | null;
}

export interface BidderNotification {
  id: string;
  bidder_id: string;
  tender_id: string;
  type: "submission_received" | "evaluation_complete" | "clarification_needed" | "rejected" | "eligible";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface BidderVerdictSummary {
  tender_id: string;
  overall_verdict: string;
  failing_criteria: string[] | null;
  manual_review_criteria: string[] | null;
  letter_text?: string;
}

// ─── API Response Wrappers ───────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}
