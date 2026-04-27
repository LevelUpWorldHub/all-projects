export type RFQStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "questions_open"
  | "bid_submitted"
  | "under_review"
  | "awarded"
  | "closed"
  | "cancelled"
  | "reopened";

export type BidStatus =
  | "draft"
  | "submitted"
  | "late_submitted"
  | "revised"
  | "under_review"
  | "awarded"
  | "not_selected"
  | "rejected"
  | "withdrawn"
  | "closed";

export type ChangeOrderStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "revision_requested"
  | "approved"
  | "rejected"
  | "executed"
  | "cancelled"
  | "closed";

export type ProjectRole =
  | "admin"
  | "project_manager"
  | "estimator"
  | "owner_rep"
  | "observer";

export type UserRole =
  | "admin"
  | "project_manager"
  | "estimator"
  | "owner_rep"
  | "observer"
  | "vendor_user";

export type Actor = {
  userId?: string;
  organizationId?: string;
  name: string;
  email: string;
  role?: UserRole;
  projectRole?: ProjectRole;
  type: "internal" | "vendor_invite" | "approval_token";
  inviteId?: string;
};

export class DomainError extends Error {
  constructor(
    message: string,
    public code:
      | "FORBIDDEN"
      | "INVALID_STATUS_TRANSITION"
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "CONFLICT",
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const rfqTransitions: Record<RFQStatus, RFQStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["viewed", "questions_open", "bid_submitted", "closed", "cancelled"],
  viewed: ["questions_open", "bid_submitted", "closed", "cancelled"],
  questions_open: ["bid_submitted", "closed", "cancelled"],
  bid_submitted: ["under_review", "awarded", "closed", "cancelled"],
  under_review: ["awarded", "closed", "cancelled"],
  awarded: ["closed"],
  closed: ["reopened"],
  cancelled: ["reopened"],
  reopened: ["sent", "closed", "cancelled"],
};

export const bidTransitions: Record<BidStatus, BidStatus[]> = {
  draft: ["submitted", "late_submitted", "withdrawn"],
  submitted: ["revised", "under_review", "withdrawn", "rejected", "awarded", "not_selected"],
  late_submitted: ["under_review", "withdrawn", "rejected", "awarded", "not_selected"],
  revised: ["under_review", "withdrawn", "rejected", "awarded", "not_selected"],
  under_review: ["awarded", "not_selected", "rejected"],
  awarded: [],
  not_selected: ["closed"],
  rejected: ["closed"],
  withdrawn: ["closed"],
  closed: [],
};

export const changeOrderTransitions: Record<ChangeOrderStatus, ChangeOrderStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_review", "revision_requested", "approved", "rejected"],
  under_review: ["approved", "rejected", "revision_requested"],
  revision_requested: ["draft", "submitted", "cancelled"],
  approved: ["executed", "closed"],
  rejected: ["closed", "draft"],
  executed: ["closed"],
  cancelled: ["closed"],
  closed: [],
};

export function assertTransition<TStatus extends string>(
  entity: "rfq" | "bid" | "change_order",
  current: TStatus,
  next: TStatus,
  transitions: Record<TStatus, TStatus[]>,
) {
  const allowed = transitions[current] ?? [];
  if (!allowed.includes(next)) {
    throw new DomainError(
      `Invalid ${entity} status transition: ${current} -> ${next}`,
      "INVALID_STATUS_TRANSITION",
      { entity, current, next, allowed },
    );
  }
}

export function assertRFQTransition(current: RFQStatus, next: RFQStatus) {
  return assertTransition("rfq", current, next, rfqTransitions);
}

export function assertBidTransition(current: BidStatus, next: BidStatus) {
  return assertTransition("bid", current, next, bidTransitions);
}

export function assertChangeOrderTransition(current: ChangeOrderStatus, next: ChangeOrderStatus) {
  return assertTransition("change_order", current, next, changeOrderTransitions);
}

export type Capability =
  | "project:view"
  | "project:manage"
  | "vendor:manage"
  | "rfq:create"
  | "rfq:update"
  | "rfq:send"
  | "rfq:view"
  | "bid:submit"
  | "bid:compare"
  | "bid:award"
  | "change_order:create"
  | "change_order:submit"
  | "change_order:approve"
  | "audit:view"
  | "file:upload"
  | "file:download";

const internalCapabilityMatrix: Record<ProjectRole, Capability[]> = {
  admin: [
    "project:view",
    "project:manage",
    "vendor:manage",
    "rfq:create",
    "rfq:update",
    "rfq:send",
    "rfq:view",
    "bid:compare",
    "bid:award",
    "change_order:create",
    "change_order:submit",
    "change_order:approve",
    "audit:view",
    "file:upload",
    "file:download",
  ],
  project_manager: [
    "project:view",
    "vendor:manage",
    "rfq:create",
    "rfq:update",
    "rfq:send",
    "rfq:view",
    "bid:compare",
    "bid:award",
    "change_order:create",
    "change_order:submit",
    "audit:view",
    "file:upload",
    "file:download",
  ],
  estimator: [
    "project:view",
    "rfq:create",
    "rfq:update",
    "rfq:view",
    "bid:compare",
    "change_order:create",
    "audit:view",
    "file:upload",
    "file:download",
  ],
  owner_rep: [
    "project:view",
    "rfq:view",
    "change_order:approve",
    "audit:view",
    "file:download",
  ],
  observer: [
    "project:view",
    "rfq:view",
    "audit:view",
    "file:download",
  ],
};

const vendorInviteCapabilities: Capability[] = [
  "rfq:view",
  "bid:submit",
  "file:download",
  "file:upload",
];

export function can(actor: Actor, capability: Capability): boolean {
  if (actor.type === "vendor_invite") {
    return vendorInviteCapabilities.includes(capability);
  }

  if (actor.type === "approval_token") {
    return ["change_order:approve", "file:download"].includes(capability);
  }

  if (!actor.projectRole) {
    return false;
  }

  return internalCapabilityMatrix[actor.projectRole]?.includes(capability) ?? false;
}

export function assertCan(actor: Actor, capability: Capability) {
  if (!can(actor, capability)) {
    throw new DomainError(`Actor cannot perform capability: ${capability}`, "FORBIDDEN", {
      capability,
      actorType: actor.type,
      role: actor.role,
      projectRole: actor.projectRole,
    });
  }
}

export function assertInternalActor(actor: Actor) {
  if (actor.type !== "internal" || !actor.userId || !actor.organizationId) {
    throw new DomainError("Internal authenticated actor required", "FORBIDDEN");
  }
}

export function assertVendorInviteActor(actor: Actor) {
  if (actor.type !== "vendor_invite" || !actor.inviteId) {
    throw new DomainError("Vendor invite actor required", "FORBIDDEN");
  }
}

export function isRFQEditable(status: RFQStatus): boolean {
  return status === "draft" || status === "reopened";
}

export function isRFQSendable(status: RFQStatus): boolean {
  return status === "draft" || status === "reopened";
}

export function isBidSubmittable(rfqStatus: RFQStatus): boolean {
  return ["sent", "viewed", "questions_open", "bid_submitted"].includes(rfqStatus);
}

export function isBidAwardable(status: BidStatus): boolean {
  return ["submitted", "late_submitted", "revised", "under_review"].includes(status);
}

export function isChangeOrderEditable(status: ChangeOrderStatus): boolean {
  return status === "draft" || status === "revision_requested";
}

export type AuditAction =
  | "project.created"
  | "vendor.created"
  | "rfq.created"
  | "rfq.updated"
  | "rfq.sent"
  | "rfq.viewed"
  | "rfq.closed"
  | "rfq.cancelled"
  | "invite.sent"
  | "invite.viewed"
  | "invite.declined"
  | "bid.started"
  | "bid.submitted"
  | "bid.late_submitted"
  | "bid.revised"
  | "bid.withdrawn"
  | "bid_comparison.viewed"
  | "award.created"
  | "award.reversed"
  | "bid.awarded"
  | "bid.not_selected"
  | "change_order.created"
  | "change_order.updated"
  | "change_order.submitted"
  | "change_order.approved"
  | "change_order.rejected"
  | "change_order.revision_requested"
  | "approval.requested"
  | "approval.approved"
  | "approval.rejected"
  | "approval.revision_requested";

export type AuditEventInput = {
  organizationId: string;
  projectId?: string;
  actor: Actor;
  action: AuditAction;
  entityType:
    | "project"
    | "vendor"
    | "rfq"
    | "rfq_invite"
    | "bid"
    | "award"
    | "change_order"
    | "approval";
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

export function buildAuditEvent(input: AuditEventInput) {
  return {
    organizationId: input.organizationId,
    projectId: input.projectId,
    actorUserId: input.actor.userId,
    actorName: input.actor.name,
    actorEmail: input.actor.email,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  };
}

export function computeBidSubmissionStatus(params: {
  dueAt: Date;
  now: Date;
  allowLateBids: boolean;
}): "submitted" | "late_submitted" {
  const isLate = params.now.getTime() > params.dueAt.getTime();

  if (isLate && !params.allowLateBids) {
    throw new DomainError("RFQ deadline has passed and late bids are not allowed", "VALIDATION_ERROR", {
      dueAt: params.dueAt.toISOString(),
      now: params.now.toISOString(),
    });
  }

  return isLate ? "late_submitted" : "submitted";
}

export function requireCommentsForDecision(decision: "approved" | "rejected" | "revision_requested", comments?: string) {
  if ((decision === "rejected" || decision === "revision_requested") && !comments?.trim()) {
    throw new DomainError("Comments are required for rejection or revision request", "VALIDATION_ERROR", {
      decision,
    });
  }
}

