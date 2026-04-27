import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const organizationStatusEnum = pgEnum("organization_status", [
  "active",
  "suspended",
  "archived",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "project_manager",
  "estimator",
  "owner_rep",
  "observer",
  "vendor_user",
]);

export const userStatusEnum = pgEnum("user_status", [
  "invited",
  "active",
  "disabled",
]);

export const vendorStatusEnum = pgEnum("vendor_status", [
  "active",
  "inactive",
  "blocked",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
]);

export const projectRoleEnum = pgEnum("project_role", [
  "admin",
  "project_manager",
  "estimator",
  "owner_rep",
  "observer",
]);

export const rfqStatusEnum = pgEnum("rfq_status", [
  "draft",
  "sent",
  "viewed",
  "questions_open",
  "bid_submitted",
  "under_review",
  "awarded",
  "closed",
  "cancelled",
  "reopened",
]);

export const rfqInviteStatusEnum = pgEnum("rfq_invite_status", [
  "pending",
  "sent",
  "viewed",
  "declined",
  "submitted",
  "expired",
  "cancelled",
]);

export const clarificationVisibilityEnum = pgEnum("clarification_visibility", [
  "private_to_vendor",
  "public_to_all_invited",
]);

export const bidStatusEnum = pgEnum("bid_status", [
  "draft",
  "submitted",
  "late_submitted",
  "revised",
  "under_review",
  "awarded",
  "not_selected",
  "rejected",
  "withdrawn",
  "closed",
]);

export const awardStatusEnum = pgEnum("award_status", [
  "active",
  "reversed",
  "closed",
]);

export const changeOrderStatusEnum = pgEnum("change_order_status", [
  "draft",
  "submitted",
  "under_review",
  "revision_requested",
  "approved",
  "rejected",
  "executed",
  "cancelled",
  "closed",
]);

export const approvalDecisionEnum = pgEnum("approval_decision", [
  "pending",
  "approved",
  "rejected",
  "revision_requested",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  status: organizationStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("organizations_slug_idx").on(table.slug),
}));

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: userRoleEnum("role").notNull().default("observer"),
  status: userStatusEnum("status").notNull().default("invited"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
  orgIdx: index("users_organization_id_idx").on(table.organizationId),
}));

export const vendors = pgTable("vendors", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  trade: varchar("trade", { length: 120 }),
  primaryContactName: varchar("primary_contact_name", { length: 255 }),
  primaryContactEmail: varchar("primary_contact_email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  status: vendorStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdx: index("vendors_organization_id_idx").on(table.organizationId),
  orgNameIdx: index("vendors_organization_name_idx").on(table.organizationId, table.name),
}));

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  projectNumber: varchar("project_number", { length: 120 }),
  location: text("location"),
  ownerName: varchar("owner_name", { length: 255 }),
  status: projectStatusEnum("status").notNull().default("planning"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdx: index("projects_organization_id_idx").on(table.organizationId),
}));

export const projectMembers = pgTable("project_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectRole: projectRoleEnum("project_role").notNull().default("observer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  projectIdx: index("project_members_project_id_idx").on(table.projectId),
  userIdx: index("project_members_user_id_idx").on(table.userId),
  uniqueMemberIdx: uniqueIndex("project_members_project_user_idx").on(table.projectId, table.userId),
}));

export const rfqs = pgTable("rfqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  trade: varchar("trade", { length: 120 }).notNull(),
  scopeSummary: text("scope_summary").notNull(),
  instructions: text("instructions").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  clarificationDeadlineAt: timestamp("clarification_deadline_at", { withTimezone: true }),
  siteWalkAt: timestamp("site_walk_at", { withTimezone: true }),
  status: rfqStatusEnum("status").notNull().default("draft"),
  allowLateBids: boolean("allow_late_bids").notNull().default(true),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdx: index("rfqs_organization_id_idx").on(table.organizationId),
  projectIdx: index("rfqs_project_id_idx").on(table.projectId),
  statusIdx: index("rfqs_status_idx").on(table.status),
  dueAtIdx: index("rfqs_due_at_idx").on(table.dueAt),
}));

export const rfqInvites = pgTable("rfq_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  rfqId: uuid("rfq_id").notNull().references(() => rfqs.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  invitedEmail: varchar("invited_email", { length: 320 }).notNull(),
  tokenHash: text("token_hash").notNull(),
  status: rfqInviteStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  rfqIdx: index("rfq_invites_rfq_id_idx").on(table.rfqId),
  vendorIdx: index("rfq_invites_vendor_id_idx").on(table.vendorId),
  emailIdx: index("rfq_invites_invited_email_idx").on(table.invitedEmail),
  uniqueActiveInviteIdx: uniqueIndex("rfq_invites_rfq_vendor_email_idx").on(
    table.rfqId,
    table.vendorId,
    table.invitedEmail,
  ),
}));

export const rfqAttachments = pgTable("rfq_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  rfqId: uuid("rfq_id").notNull().references(() => rfqs.id, { onDelete: "cascade" }),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, { onDelete: "set null" }),
  fileName: text("file_name").notNull(),
  storageKey: text("storage_key").notNull(),
  fileType: varchar("file_type", { length: 120 }),
  fileSizeBytes: integer("file_size_bytes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  rfqIdx: index("rfq_attachments_rfq_id_idx").on(table.rfqId),
}));

export const clarifications = pgTable("clarifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  rfqId: uuid("rfq_id").notNull().references(() => rfqs.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  questionText: text("question_text").notNull(),
  answerText: text("answer_text"),
  visibility: clarificationVisibilityEnum("visibility").notNull().default("private_to_vendor"),
  askedByUserId: uuid("asked_by_user_id").references(() => users.id, { onDelete: "set null" }),
  answeredByUserId: uuid("answered_by_user_id").references(() => users.id, { onDelete: "set null" }),
  askedAt: timestamp("asked_at", { withTimezone: true }).notNull().defaultNow(),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
}, (table) => ({
  rfqIdx: index("clarifications_rfq_id_idx").on(table.rfqId),
  vendorIdx: index("clarifications_vendor_id_idx").on(table.vendorId),
}));

export const bids = pgTable("bids", {
  id: uuid("id").defaultRandom().primaryKey(),
  rfqId: uuid("rfq_id").notNull().references(() => rfqs.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  inviteId: uuid("invite_id").references(() => rfqInvites.id, { onDelete: "set null" }),
  submittedByName: varchar("submitted_by_name", { length: 255 }),
  submittedByEmail: varchar("submitted_by_email", { length: 320 }),
  totalAmountCents: integer("total_amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  scopeIncluded: text("scope_included").notNull(),
  exclusions: text("exclusions").notNull(),
  assumptions: text("assumptions"),
  scheduleNotes: text("schedule_notes"),
  status: bidStatusEnum("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  isLate: boolean("is_late").notNull().default(false),
  currentVersionNumber: integer("current_version_number").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  rfqIdx: index("bids_rfq_id_idx").on(table.rfqId),
  vendorIdx: index("bids_vendor_id_idx").on(table.vendorId),
  statusIdx: index("bids_status_idx").on(table.status),
  rfqVendorIdx: index("bids_rfq_vendor_idx").on(table.rfqId, table.vendorId),
}));

export const bidVersions = pgTable("bid_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  bidId: uuid("bid_id").notNull().references(() => bids.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  totalAmountCents: integer("total_amount_cents").notNull(),
  scopeIncluded: text("scope_included").notNull(),
  exclusions: text("exclusions").notNull(),
  assumptions: text("assumptions"),
  scheduleNotes: text("schedule_notes"),
  submittedByName: varchar("submitted_by_name", { length: 255 }),
  submittedByEmail: varchar("submitted_by_email", { length: 320 }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  changeReason: text("change_reason"),
}, (table) => ({
  bidIdx: index("bid_versions_bid_id_idx").on(table.bidId),
  uniqueVersionIdx: uniqueIndex("bid_versions_bid_version_idx").on(table.bidId, table.versionNumber),
}));

export const bidAttachments = pgTable("bid_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bidId: uuid("bid_id").notNull().references(() => bids.id, { onDelete: "cascade" }),
  bidVersionId: uuid("bid_version_id").references(() => bidVersions.id, { onDelete: "set null" }),
  fileName: text("file_name").notNull(),
  storageKey: text("storage_key").notNull(),
  fileType: varchar("file_type", { length: 120 }),
  fileSizeBytes: integer("file_size_bytes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  bidIdx: index("bid_attachments_bid_id_idx").on(table.bidId),
  versionIdx: index("bid_attachments_bid_version_id_idx").on(table.bidVersionId),
}));

export const awards = pgTable("awards", {
  id: uuid("id").defaultRandom().primaryKey(),
  rfqId: uuid("rfq_id").notNull().references(() => rfqs.id, { onDelete: "cascade" }),
  bidId: uuid("bid_id").notNull().references(() => bids.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  awardedAmountCents: integer("awarded_amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  awardNotes: text("award_notes").notNull(),
  awardedByUserId: uuid("awarded_by_user_id").references(() => users.id, { onDelete: "set null" }),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
  status: awardStatusEnum("status").notNull().default("active"),
  reversedByUserId: uuid("reversed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  reversedAt: timestamp("reversed_at", { withTimezone: true }),
  reversalReason: text("reversal_reason"),
}, (table) => ({
  rfqIdx: index("awards_rfq_id_idx").on(table.rfqId),
  bidIdx: index("awards_bid_id_idx").on(table.bidId),
  vendorIdx: index("awards_vendor_id_idx").on(table.vendorId),
}));

export const changeOrders = pgTable("change_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  rfqId: uuid("rfq_id").references(() => rfqs.id, { onDelete: "set null" }),
  bidId: uuid("bid_id").references(() => bids.id, { onDelete: "set null" }),
  awardId: uuid("award_id").references(() => awards.id, { onDelete: "set null" }),
  vendorId: uuid("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  reason: text("reason").notNull(),
  scopeDescription: text("scope_description").notNull(),
  costImpactCents: integer("cost_impact_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  scheduleImpactDays: integer("schedule_impact_days").notNull().default(0),
  status: changeOrderStatusEnum("status").notNull().default("draft"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdx: index("change_orders_organization_id_idx").on(table.organizationId),
  projectIdx: index("change_orders_project_id_idx").on(table.projectId),
  statusIdx: index("change_orders_status_idx").on(table.status),
}));

export const approvals = pgTable("approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  changeOrderId: uuid("change_order_id").notNull().references(() => changeOrders.id, { onDelete: "cascade" }),
  approverUserId: uuid("approver_user_id").references(() => users.id, { onDelete: "set null" }),
  approverName: varchar("approver_name", { length: 255 }).notNull(),
  approverEmail: varchar("approver_email", { length: 320 }).notNull(),
  decision: approvalDecisionEnum("decision").notNull().default("pending"),
  comments: text("comments"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  changeOrderIdx: index("approvals_change_order_id_idx").on(table.changeOrderId),
}));

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  actorName: varchar("actor_name", { length: 255 }).notNull(),
  actorEmail: varchar("actor_email", { length: 320 }).notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  metadata: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default({}),
  ipAddress: varchar("ip_address", { length: 80 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orgIdx: index("audit_events_organization_id_idx").on(table.organizationId),
  projectIdx: index("audit_events_project_id_idx").on(table.projectId),
  entityIdx: index("audit_events_entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("audit_events_created_at_idx").on(table.createdAt),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  vendors: many(vendors),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  members: many(projectMembers),
  rfqs: many(rfqs),
  changeOrders: many(changeOrders),
}));

export const rfqsRelations = relations(rfqs, ({ one, many }) => ({
  project: one(projects, {
    fields: [rfqs.projectId],
    references: [projects.id],
  }),
  invites: many(rfqInvites),
  attachments: many(rfqAttachments),
  bids: many(bids),
  awards: many(awards),
  clarifications: many(clarifications),
}));

export const bidsRelations = relations(bids, ({ one, many }) => ({
  rfq: one(rfqs, {
    fields: [bids.rfqId],
    references: [rfqs.id],
  }),
  vendor: one(vendors, {
    fields: [bids.vendorId],
    references: [vendors.id],
  }),
  versions: many(bidVersions),
  attachments: many(bidAttachments),
}));

export const changeOrdersRelations = relations(changeOrders, ({ one, many }) => ({
  project: one(projects, {
    fields: [changeOrders.projectId],
    references: [projects.id],
  }),
  award: one(awards, {
    fields: [changeOrders.awardId],
    references: [awards.id],
  }),
  approvals: many(approvals),
}));

