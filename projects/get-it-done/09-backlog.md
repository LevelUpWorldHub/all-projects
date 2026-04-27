# Get It Done First Build-Ticket Backlog

## Sprint Objective

Build the first operating unit for Get It Done:

```text
RFQ → Vendor Invite → Bid Submission → Bid Comparison → Award → Change Order → Approval + Audit Trail
```

## Backlog Summary

| ID | Title | Priority | Status | Board Route |
|---|---|---:|---|---|
| GID-001 | Define RFQ/Bid happy path | P0 | Ready | Chair + You AI + Jailbreak |
| GID-002 | Create project and vendor foundations | P0 | Ready | You AI |
| GID-003 | Build RFQ creation flow | P0 | Ready | You AI + AI Girlfriend |
| GID-004 | Build vendor invite flow | P0 | Ready | You AI + Jailbreak |
| GID-005 | Build vendor RFQ view | P0 | Ready | AI Girlfriend + Jailbreak |
| GID-006 | Build bid submission flow | P0 | Ready | You AI + Jailbreak |
| GID-007 | Build bid comparison view | P0 | Ready | You AI + AI Girlfriend |
| GID-008 | Build award decision flow | P0 | Ready | You AI + Jailbreak |
| GID-009 | Build change order creation from award | P0 | Ready | You AI + Jailbreak |
| GID-010 | Build change order approval flow | P0 | Ready | Jailbreak + AI Girlfriend |
| GID-011 | Implement audit event system | P0 | Ready | Jailbreak |
| GID-012 | Implement permissions and access rules | P0 | Ready | Jailbreak + You AI |
| GID-013 | Create RFQ/Bid edge-case test suite | P0 | Ready | Jailbreak |
| GID-014 | Create status-driven dashboard / next-action view | P1 | Triage | AI Girlfriend + You AI |
| GID-015 | Add clarification Q&A | P1 | Triage | You AI + Jailbreak |
| GID-016 | Add bid revisions/versioning | P1 | Triage | Jailbreak + You AI |
| GID-017 | Add RFQ templates | P1 | Triage | You AI |
| GID-018 | Add PDF export | P1 | Triage | You AI |
| GID-019 | Add line-item pricing | P1 | Triage | You AI |
| GID-020 | Add AI bid comparison summary | P2 | Later | Chair + Jailbreak |

---

## P0 Tickets

## GID-001: Define RFQ/Bid Happy Path

### User story

As a project manager, I want a clear RFQ-to-award workflow so I can request pricing, compare bids, and select a vendor without losing project context.

### Scope

Document:

- User roles.
- Workflow stages.
- Required fields.
- Status transitions.
- Acceptance criteria.
- Edge cases.

### Acceptance criteria

- Given the spec is complete, when engineering reviews it, then they can identify the core screens, entities, and state transitions.
- Given an edge case is discovered, when it affects the P0 workflow, then it is captured in the test suite or open questions.

### Dependencies

None.

---

## GID-002: Create Project and Vendor Foundations

### User story

As a GC/admin, I want projects and vendors defined so RFQs can be tied to real project and subcontractor records.

### Scope

Build or define:

- Organization.
- User.
- Project.
- ProjectMember.
- Vendor.

### Acceptance criteria

- Given I am an authorized user, when I create a project, then it is stored with organization, name, location, and status.
- Given I am an authorized user, when I add a vendor, then the vendor can be selected for RFQ invites.
- Given a user is not a project member, when they try to access project RFQs, then access is denied.

### Dependencies

Auth/user model.

---

## GID-003: Build RFQ Creation Flow

### User story

As a PM/estimator, I want to create a structured RFQ so vendors get clear and comparable pricing instructions.

### Scope

Fields:

- Project.
- Title.
- Trade.
- Scope summary.
- Instructions.
- Due date.
- Attachments.
- Vendors.

### Acceptance criteria

- Given required fields are complete, when I save, then RFQ is saved as Draft.
- Given required fields are missing, when I try to send, then the system shows validation errors.
- Given an RFQ is sent, then status changes to Sent and audit event is created.

### Dependencies

GID-002.

---

## GID-004: Build Vendor Invite Flow

### User story

As a PM/estimator, I want to invite vendors to an RFQ so they can view the scope and submit bids.

### Scope

- Select vendors.
- Send invite.
- Track invite status.
- Generate secure access link or vendor account invite.

### Acceptance criteria

- Given a vendor is selected, when RFQ is sent, then an invite is created.
- Given a duplicate vendor is selected, when I send, then the system prevents duplicate active invites.
- Given an invite is sent, then audit event records vendor, email, RFQ, and sender.

### Dependencies

GID-002, GID-003.

---

## GID-005: Build Vendor RFQ View

### User story

As a vendor, I want to view RFQ details and attachments so I can decide whether and how to bid.

### Scope

- Secure RFQ access.
- RFQ details.
- Due date.
- Attachments.
- Submission CTA.

### Acceptance criteria

- Given I am invited, when I open the RFQ, then I can view details and attachments.
- Given I am not invited, when I try to access the RFQ, then access is denied.
- Given I view the RFQ, then invite status changes to Viewed and audit event is recorded.

### Dependencies

GID-004.

---

## GID-006: Build Bid Submission Flow

### User story

As a vendor, I want to submit a structured bid so the GC can compare my proposal.

### Scope

Fields:

- Total amount.
- Scope included.
- Exclusions.
- Assumptions.
- Schedule notes.
- Attachments.

### Acceptance criteria

- Given required fields are complete, when I submit, then bid status becomes Submitted.
- Given the due date passed, when I submit, then the bid is blocked or marked Late Submitted based on RFQ setting.
- Given a bid is submitted, then the GC/PM can see it in the RFQ.
- Given a bid is submitted, then audit event is created.

### Dependencies

GID-005.

---

## GID-007: Build Bid Comparison View

### User story

As a PM/estimator, I want to compare bids side by side so I can make a confident award decision.

### Scope

Comparison fields:

- Vendor.
- Status.
- Total amount.
- Submitted at.
- Scope included.
- Exclusions.
- Assumptions.
- Attachments.
- Internal notes.

### Acceptance criteria

- Given multiple bids are submitted, when I open comparison, then I can compare amount, scope, exclusions, and attachments.
- Given a bid is late, when I compare bids, then the late status is visible.
- Given a vendor has not submitted, when I compare bids, then their invite/submission status is visible.

### Dependencies

GID-006.

---

## GID-008: Build Award Decision Flow

### User story

As a PM, I want to award a bid so the selected vendor and scope become part of the project record.

### Scope

- Award selected bid.
- Require award note.
- Mark non-selected bids.
- Create award record.
- Audit event.

### Acceptance criteria

- Given I have permission, when I award a bid, then the bid status becomes Awarded.
- Given a bid is awarded, then other submitted bids become Not Selected.
- Given I award a bid, then an Award record and audit event are created.
- Given I lack permission, when I try to award, then access is denied.

### Dependencies

GID-007, GID-012.

---

## GID-009: Build Change Order Creation From Award

### User story

As a PM, I want to create a change order from an awarded bid so scope and cost impact can be approved.

### Scope

- Create CO from award.
- Prefill project, vendor, RFQ, bid, amount, and scope where possible.
- Allow cost/schedule impact.
- Attach supporting files.

### Acceptance criteria

- Given an awarded bid exists, when I create a CO, then relevant project/vendor/bid fields are prefilled.
- Given required CO fields are complete, when I submit, then CO status becomes Submitted.
- Given a CO is submitted, then audit event is created.

### Dependencies

GID-008.

---

## GID-010: Build Change Order Approval Flow

### User story

As an approver, I want to approve, reject, or request revision on a change order so project cost/scope changes are controlled.

### Scope

- Approval screen.
- Approve.
- Reject.
- Request revision.
- Comments.
- Audit event.

### Acceptance criteria

- Given I am an authorized approver, when I approve, then CO status becomes Approved.
- Given I reject, then CO status becomes Rejected and comments are required.
- Given I request revision, then CO status becomes Revision Requested and comments are required.
- Given I am not authorized, when I try to approve, then access is denied.

### Dependencies

GID-009, GID-012.

---

## GID-011: Implement Audit Event System

### User story

As a project stakeholder, I want an audit trail so decisions and commercial changes can be verified later.

### Scope

Capture events:

- RFQ created.
- RFQ sent.
- RFQ viewed.
- Bid submitted.
- Bid revised.
- Bid awarded.
- CO created.
- CO submitted.
- CO approved/rejected/revision requested.
- Permission-sensitive changes.

### Acceptance criteria

- Given a tracked action occurs, then an audit event is created with actor, action, timestamp, entity, and metadata.
- Given an audit event exists, then it cannot be edited or deleted through normal application flows.
- Given an entity is viewed, then relevant audit events can be displayed chronologically.

### Dependencies

Should be implemented alongside P0 workflow actions.

---

## GID-012: Implement Permissions and Access Rules

### User story

As an organization admin, I want role-based access so project and bid information is protected.

### Scope

- Project membership.
- Role capabilities.
- Vendor invite access.
- Owner approval access.

### Acceptance criteria

- Given a user is not assigned to a project, when they access project RFQs, then access is denied.
- Given a vendor is invited to one RFQ, when they try to access another RFQ, then access is denied.
- Given an owner rep is assigned to approve a CO, when they access the CO, then they can approve/reject/request revision.
- Given a vendor tries to view competitor bids, then access is denied.

### Dependencies

Auth/session model.

---

## GID-013: Create RFQ/Bid Edge-Case Test Suite

### User story

As the product owner, I want edge-case tests so the RFQ/Bid workflow does not create commercial risk.

### Scope

Test:

- Late bids.
- Duplicate invites.
- Unauthorized access.
- Permission changes.
- Bid revisions.
- Award reversal.
- Attachment mismatch.
- Change-order approval.
- Audit immutability.

### Acceptance criteria

- Given the P0 workflow exists, then every status transition has at least one positive and one negative test.
- Given permission-sensitive data exists, then unauthorized users cannot access it.
- Given audit events exist, then delete/update attempts fail.

### Dependencies

GID-003 through GID-012.

---

## First Sprint Recommended Order

1. GID-001: Define RFQ/Bid happy path.
2. GID-002: Create project and vendor foundations.
3. GID-003: Build RFQ creation flow.
4. GID-004: Build vendor invite flow.
5. GID-005: Build vendor RFQ view.
6. GID-006: Build bid submission flow.
7. GID-011: Implement audit event system in parallel.
8. GID-012: Implement permissions in parallel.
9. GID-007: Build bid comparison view.
10. GID-008: Build award decision flow.
11. GID-009: Build change order creation.
12. GID-010: Build approval flow.
13. GID-013: Complete edge-case test suite.

---

## Out Of Scope For First Sprint

- BIM integration.
- ERP/payroll sync.
- Accounting ledger.
- AI bid recommendation.
- Full mobile field app.
- Multi-step approval chains.
- Multi-award RFQs.
- Vendor performance scoring.
- Procurement analytics.
- Owner billing automation.

