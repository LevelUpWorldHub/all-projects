# Get It Done Sprint-Ready Engineering Tickets

## Sprint Objective

Implement the first RFQ/Bid/change-order operating unit:

```text
Project → Vendor → RFQ → Invite → Vendor RFQ View → Bid Submission → Bid Comparison → Award → Change Order → Approval → Audit Trail
```

## Sprint Rules

1. Route handlers stay thin.
2. Domain services own business rules.
3. Every P0 mutation creates an audit event.
4. Permission checks happen before data access.
5. State changes use status transition guards.
6. File access always goes through signed URL helpers.
7. Email can be direct for v1, but service boundary should allow queue/outbox later.

---

## Milestone 0: Foundations

## GID-ENG-001: Add Drizzle schema and migrations

### Priority

P0

### Goal

Create database schema for the RFQ/Bid/change-order workflow.

### Scope

Implement tables/enums from `01-drizzle-schema-draft.ts`:

- organizations
- users
- vendors
- projects
- project_members
- rfqs
- rfq_invites
- rfq_attachments
- clarifications
- bids
- bid_versions
- bid_attachments
- awards
- change_orders
- approvals
- audit_events

### Implementation notes

- Split schema into files if project conventions prefer.
- Generate and commit Drizzle migrations.
- Add indexes for organization, project, status, due date, entity lookup, and audit created date.
- Store money as integer cents.
- Store audit metadata as jsonb.

### Acceptance criteria

- Given migrations run on an empty Postgres database, all tables/enums are created successfully.
- Given schema is imported, TypeScript compiles without type errors.
- Given a table references another table, foreign keys match intended delete behavior.

### Tests

- Migration smoke test.
- Typecheck.

### Dependencies

None.

---

## GID-ENG-002: Implement domain guards and permissions helpers

### Priority

P0

### Goal

Centralize status transitions, permission checks, and actor types.

### Scope

Create:

- `lib/domain/guards.ts`
- `lib/auth/permissions.ts`
- `lib/auth/session.ts`
- `lib/auth/vendor-access.ts`

Include:

- RFQ status transitions.
- Bid status transitions.
- Change order status transitions.
- Capability matrix.
- Actor model.
- DomainError.
- Late bid status computation.

### Acceptance criteria

- Given an invalid RFQ transition, `assertRFQTransition` throws `INVALID_STATUS_TRANSITION`.
- Given an unauthorized actor, `assertCan` throws `FORBIDDEN`.
- Given a vendor invite actor, they can view RFQ and submit bid but cannot compare bids.
- Given an internal PM actor, they can create/send RFQs and award bids.

### Tests

- Unit tests for RFQ transitions.
- Unit tests for bid transitions.
- Unit tests for change-order transitions.
- Unit tests for capability matrix.
- Unit tests for late-bid handling.

### Dependencies

None.

---

## GID-ENG-003: Implement audit event service

### Priority

P0

### Goal

Provide one helper for writing append-only audit events.

### Scope

Create:

- `lib/services/audit.service.ts`

Functions:

```ts
recordAuditEvent(tx, input)
listAuditEventsForEntity(actor, entityType, entityId)
```

### Implementation notes

- Accept a transaction object for mutations.
- Do not expose update/delete methods.
- Include actor, action, entity, metadata, ip, user agent.
- Use audit service in all P0 mutation services.

### Acceptance criteria

- Given a service mutation calls `recordAuditEvent`, an audit row is created.
- Given an entity has multiple events, listing returns chronological events.
- No app-level update/delete audit event helper exists.

### Tests

- Integration test for recording audit event.
- Unit test for event input validation if schemas are added.

### Dependencies

GID-ENG-001.

---

## Milestone 1: Project and Vendor Foundations

## GID-ENG-004: Implement project service and routes

### Priority

P0

### Goal

Allow internal users to create/list projects and enforce project access.

### Routes

- `GET /api/projects`
- `POST /api/projects`

### Service

`projectService`

Functions:

```ts
createProject(actor, input)
listVisibleProjects(actor)
assertProjectAccess(actor, projectId, capability)
addProjectMember(actor, projectId, input)
```

### Acceptance criteria

- Given an admin/PM creates a project, project is saved and audit event `project.created` is recorded.
- Given a user is not in a project, project-scoped access is denied.
- Given an admin lists projects, they see organization projects.
- Given a non-admin lists projects, they see only assigned projects.

### Tests

- Create project integration test.
- Project access permission test.
- Audit event test.

### Dependencies

GID-ENG-001, GID-ENG-002, GID-ENG-003.

---

## GID-ENG-005: Implement vendor service and routes

### Priority

P0

### Goal

Allow internal users to create/list vendors for RFQ invites.

### Routes

- `GET /api/vendors`
- `POST /api/vendors`

### Service

`vendorService`

Functions:

```ts
createVendor(actor, input)
updateVendor(actor, vendorId, input)
listVendors(actor, filters)
```

### Acceptance criteria

- Given an authorized actor creates vendor, vendor is saved under organization.
- Given an unauthorized actor tries to manage vendors, request is denied.
- Given vendor is created, audit event `vendor.created` is recorded.

### Tests

- Create vendor integration test.
- Vendor permission test.
- Organization boundary test.

### Dependencies

GID-ENG-001, GID-ENG-002, GID-ENG-003.

---

## Milestone 2: RFQ Creation and Invite

## GID-ENG-006: Implement RFQ draft creation/update

### Priority

P0

### Goal

Allow PM/estimator to create and edit RFQ drafts.

### Routes

- `POST /api/rfqs`
- `GET /api/rfqs/{rfqId}`
- `PATCH /api/rfqs/{rfqId}`

### Service

`rfqService.createDraft`

`rfqService.updateDraft`

`rfqService.getInternalView`

### Acceptance criteria

- Given authorized actor creates RFQ with required fields, RFQ status is `draft`.
- Given RFQ is `draft` or `reopened`, actor can update it.
- Given RFQ is `sent`, actor cannot edit fields that would materially change scope unless later revision flow exists.
- Given RFQ is created, audit event `rfq.created` is recorded.

### Tests

- RFQ create integration test.
- RFQ update allowed status test.
- RFQ update forbidden status test.
- Audit event test.

### Dependencies

GID-ENG-004.

---

## GID-ENG-007: Implement RFQ send and vendor invite flow

### Priority

P0

### Goal

Send RFQ to vendors and create secure invite tokens.

### Route

- `POST /api/rfqs/{rfqId}/send`

### Service

`rfqService.send`

### Acceptance criteria

- Given RFQ is sendable and required fields are complete, sending creates one invite per vendor.
- Given duplicate vendor/email invite exists, service prevents duplicate active invite.
- Given RFQ is sent, status becomes `sent`.
- Given invites are created, token hashes are stored and raw tokens are only used for email link generation.
- Given RFQ is sent, audit events `rfq.sent` and `invite.sent` are recorded.
- Given email provider fails, RFQ/invite database state remains consistent and failure is surfaced or queued for retry.

### Tests

- Send RFQ happy path.
- Duplicate invite prevention.
- Invalid status send blocked.
- Audit event test.
- Token hash test.

### Dependencies

GID-ENG-005, GID-ENG-006.

---

## GID-ENG-008: Implement vendor RFQ view by invite token

### Priority

P0

### Goal

Allow invited vendors to view scoped RFQ details.

### Route

- `GET /api/vendor/rfq/{inviteToken}`

### Service

`rfqService.getVendorRfqView`

### Acceptance criteria

- Given valid invite token, vendor can view only that RFQ.
- Given invalid/expired/cancelled token, access is denied.
- Given vendor views RFQ first time, invite status becomes `viewed`.
- Given RFQ has not been viewed before, RFQ may transition to `viewed`.
- Given vendor views RFQ, audit events `invite.viewed` and `rfq.viewed` are recorded.

### Tests

- Valid token access test.
- Invalid token denied.
- Expired token denied.
- Scoped data test.
- Audit event test.

### Dependencies

GID-ENG-007.

---

## Milestone 3: Bid Submission and Comparison

## GID-ENG-009: Implement bid submission from invite

### Priority

P0

### Goal

Allow invited vendors to submit structured bids.

### Route

- `POST /api/bids`

### Service

`bidService.submitFromInvite`

### Acceptance criteria

- Given valid invite and RFQ is open for bids, vendor can submit bid.
- Given required bid fields are missing, validation fails.
- Given bid is submitted before deadline, status is `submitted`.
- Given bid is submitted after deadline and late bids are allowed, status is `late_submitted`.
- Given bid is submitted after deadline and late bids are blocked, submission fails.
- Given bid is submitted, bid version 1 is created.
- Given bid is submitted, invite status becomes `submitted` and RFQ status becomes `bid_submitted` if applicable.
- Given bid is submitted, audit event `bid.submitted` or `bid.late_submitted` is recorded.

### Tests

- Submit bid happy path.
- Late bid allowed.
- Late bid blocked.
- Missing required fields.
- Vendor cannot submit to another invite.
- Audit event test.

### Dependencies

GID-ENG-008.

---

## GID-ENG-010: Implement bid comparison endpoint/view model

### Priority

P0

### Goal

Allow PM/estimator to compare submitted bids side by side.

### Route

- `GET /api/rfqs/{rfqId}/compare`

### Service

`bidService.getComparison`

### Acceptance criteria

- Given internal actor has bid comparison permission, comparison data is returned.
- Given actor lacks permission, access is denied.
- Comparison includes vendor, amount, status, submitted time, scope, exclusions, assumptions, schedule notes, and attachments.
- Late bids are visibly marked.
- Vendors cannot access comparison data.
- Optional audit event `bid_comparison.viewed` is recorded.

### Tests

- Comparison data test.
- Permission denied test.
- Vendor access denied test.
- Late bid label test.

### Dependencies

GID-ENG-009.

---

## Milestone 4: Award and Change Order

## GID-ENG-011: Implement award bid flow

### Priority

P0

### Goal

Allow authorized PM/admin to award a bid and close out other bid outcomes.

### Route

- `POST /api/awards`

### Service

`awardService.awardBid`

### Acceptance criteria

- Given actor can award and bid is awardable, award row is created.
- Given bid is awarded, selected bid status becomes `awarded`.
- Given other submitted/revised/under_review bids exist, they become `not_selected`.
- Given RFQ is awarded, RFQ status becomes `awarded`.
- Given award action succeeds, audit events are recorded.
- Given actor lacks permission, action is denied.
- Given bid does not belong to RFQ, action fails.

### Tests

- Award happy path.
- Other bids marked not selected.
- Unauthorized award denied.
- Invalid bid/RFQ mismatch.
- Audit event test.
- Transaction rollback test.

### Dependencies

GID-ENG-010.

---

## GID-ENG-012: Implement change order creation from award

### Priority

P0

### Goal

Create draft change order from awarded bid.

### Route

- `POST /api/change-orders/from-award`

### Service

`changeOrderService.createFromAward`

### Acceptance criteria

- Given awarded bid exists, actor can create draft CO from award.
- CO pre-fills project, RFQ, bid, award, vendor, amount, and scope where available.
- Given actor lacks permission, action is denied.
- Given CO is created, audit event `change_order.created` is recorded.

### Tests

- Create CO from award happy path.
- Non-awarded bid blocked.
- Permission denied.
- Audit event test.

### Dependencies

GID-ENG-011.

---

## GID-ENG-013: Implement change order submit and approval decision

### Priority

P0

### Goal

Allow CO submission and approval/rejection/revision request.

### Routes

- `POST /api/change-orders/{changeOrderId}/submit`
- `POST /api/change-orders/{changeOrderId}/approve`
- `POST /api/change-orders/{changeOrderId}/reject`
- `POST /api/change-orders/{changeOrderId}/request-revision`

### Service

`changeOrderService.submit`

`changeOrderService.decideApproval`

### Acceptance criteria

- Given draft CO has required fields, actor can submit for approval.
- Given CO is submitted, approval row is created.
- Given authorized approver approves, CO status becomes `approved`.
- Given authorized approver rejects, CO status becomes `rejected` and comments are required.
- Given authorized approver requests revision, CO status becomes `revision_requested` and comments are required.
- Given unauthorized actor attempts approval, action is denied.
- All decisions create audit events.

### Tests

- Submit CO happy path.
- Approve happy path.
- Reject requires comments.
- Revision request requires comments.
- Unauthorized approval denied.
- Audit event test.

### Dependencies

GID-ENG-012.

---

## Milestone 5: Files, Email, and E2E

## GID-ENG-014: Implement file upload/download service

### Priority

P1 for first sprint unless attachments are required for demo

### Goal

Support secure entity-scoped file uploads and downloads.

### Routes

- `POST /api/files/presign`
- `GET /api/files/{fileId}/download`

### Service

`fileService`

### Acceptance criteria

- Given actor can write to entity, upload URL is generated.
- Given actor cannot access entity, upload/download is denied.
- File metadata is saved with entity association.
- Permanent public URLs are not exposed.

### Tests

- Upload permission test.
- Download permission test.
- Vendor scoped file access test.

### Dependencies

GID-ENG-006, GID-ENG-009.

---

## GID-ENG-015: Implement email/invite service

### Priority

P0 for invite email, P1 for notifications

### Goal

Send transactional emails for RFQ invite and key workflow events.

### Service

`emailService`

### Required v1 emails

- Vendor RFQ invite.
- Bid submitted notification to PM.
- Change-order approval request.

### Acceptance criteria

- Given RFQ is sent, vendor receives invite email with scoped link.
- Given bid is submitted, PM/estimator receives notification.
- Given CO is submitted, approver receives approval request.
- Email provider errors are logged and do not leave DB transaction half-written.

### Tests

- Mock email send test.
- Invite email payload test.
- Failure handling test.

### Dependencies

GID-ENG-007, GID-ENG-009, GID-ENG-013.

---

## GID-ENG-016: Implement P0 workflow E2E test

### Priority

P0

### Goal

Prove the end-to-end commercial loop works.

### Flow

```text
Create project
Create vendor
Create RFQ
Send RFQ
Open vendor invite
Submit bid
Compare bids
Award bid
Create change order
Submit change order
Approve change order
Verify audit trail
```

### Acceptance criteria

- Full flow completes in test environment.
- Audit trail contains expected major events.
- Unauthorized vendor cannot access another RFQ.
- Unauthorized internal user cannot award.

### Tests

- Playwright or integration E2E test.
- Permission negative path.

### Dependencies

GID-ENG-001 through GID-ENG-015.

---

## Recommended Sprint Sequencing

### Sprint 1A: Domain and DB

1. GID-ENG-001
2. GID-ENG-002
3. GID-ENG-003
4. GID-ENG-004
5. GID-ENG-005

### Sprint 1B: RFQ and Vendor Bid

1. GID-ENG-006
2. GID-ENG-007
3. GID-ENG-008
4. GID-ENG-009
5. GID-ENG-010

### Sprint 1C: Award, CO, Audit Hardening

1. GID-ENG-011
2. GID-ENG-012
3. GID-ENG-013
4. GID-ENG-015
5. GID-ENG-016

### Sprint 1D: Attachments and UX polish

1. GID-ENG-014
2. Next-action dashboard
3. Clarifications
4. Bid revisions

---

## Definition of Done For This Implementation Phase

The implementation plan is ready to hand to a coding agent or engineer when:

1. Stack assumptions are documented.
2. Drizzle schema draft exists.
3. API route/service layout exists.
4. Status guards, permissions, and audit helper draft exists.
5. Sprint-ready engineering tickets exist.
6. Open questions are identified.

This package now satisfies those conditions.

