# Get It Done Initial Data Model

## Scope

This model supports the first value loop:

```text
Project → RFQ → Vendor Invite → Bid → Award → Change Order → Approval → Audit Trail
```

The model is intentionally narrow. It should support the RFQ/Bid loop without forcing premature BIM, ERP, payroll, or accounting integration.

## Entity Relationship Overview

```text
Organization
  └── User
  └── Vendor
  └── Project
        └── ProjectMember
        └── RFQ
              └── RFQInvite
              └── RFQAttachment
              └── Clarification
              └── Bid
                    └── BidAttachment
                    └── BidVersion
              └── Award
                    └── ChangeOrder
                          └── Approval
  └── AuditEvent
```

## Core Entities

## Organization

Represents a customer company/account.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | string | Company name |
| slug | string | Unique workspace identifier |
| status | enum | active, suspended, archived |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## User

Represents a person using the system.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| organization_id | uuid | Nullable for external vendor users if needed |
| name | string |  |
| email | string | Unique within auth boundary |
| role | enum | admin, project_manager, estimator, owner_rep, observer, vendor_user |
| status | enum | invited, active, disabled |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## Vendor

Represents a subcontractor/vendor company.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| organization_id | uuid | Owning GC/customer organization |
| name | string | Vendor company name |
| trade | string | Electrical, plumbing, concrete, etc. |
| primary_contact_name | string |  |
| primary_contact_email | string |  |
| phone | string | Optional |
| status | enum | active, inactive, blocked |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## Project

Represents a construction project.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| organization_id | uuid |  |
| name | string |  |
| project_number | string | Optional but useful |
| location | string |  |
| owner_name | string |  |
| status | enum | planning, active, on_hold, completed, archived |
| created_by_user_id | uuid |  |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## ProjectMember

Controls access per project.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| project_id | uuid |  |
| user_id | uuid |  |
| project_role | enum | admin, project_manager, estimator, owner_rep, observer |
| created_at | timestamp |  |

Constraint:

- Unique `project_id + user_id`.

## RFQ

Represents a request for quote/pricing.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| organization_id | uuid |  |
| project_id | uuid |  |
| title | string | Required |
| trade | string | Required |
| scope_summary | text | Required |
| instructions | text | Required |
| due_at | timestamp | Required |
| clarification_deadline_at | timestamp | Optional |
| site_walk_at | timestamp | Optional |
| status | enum | draft, sent, viewed, questions_open, bid_submitted, under_review, awarded, closed, cancelled, reopened |
| allow_late_bids | boolean | Default false or true by product decision |
| created_by_user_id | uuid |  |
| sent_at | timestamp | Nullable |
| closed_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## RFQInvite

Represents an invitation to a vendor.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| rfq_id | uuid |  |
| vendor_id | uuid |  |
| invited_email | string | Contact email used |
| token_hash | string | For magic-link access if used |
| status | enum | pending, sent, viewed, declined, submitted, expired, cancelled |
| sent_at | timestamp |  |
| viewed_at | timestamp | Nullable |
| responded_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

Constraints:

- Unique active invite per `rfq_id + vendor_id + invited_email`.

## RFQAttachment

Files attached to an RFQ.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| rfq_id | uuid |  |
| uploaded_by_user_id | uuid |  |
| file_name | string |  |
| file_url | string | Or storage key |
| file_type | string | MIME type |
| file_size_bytes | integer |  |
| created_at | timestamp |  |

## Clarification

Questions and answers tied to an RFQ.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| rfq_id | uuid |  |
| vendor_id | uuid | Nullable if internal note/question |
| question_text | text | Required |
| answer_text | text | Nullable until answered |
| visibility | enum | private_to_vendor, public_to_all_invited |
| asked_by_user_id | uuid | Nullable for magic-link vendor contact |
| answered_by_user_id | uuid | Nullable |
| asked_at | timestamp |  |
| answered_at | timestamp | Nullable |

## Bid

Represents a vendor bid/proposal.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| rfq_id | uuid |  |
| vendor_id | uuid |  |
| invite_id | uuid | Nullable but recommended |
| submitted_by_name | string | Useful for external contacts |
| submitted_by_email | string |  |
| total_amount_cents | integer | Store money as integer cents |
| currency | string | Default USD |
| scope_included | text | Required |
| exclusions | text | Required or explicit none |
| assumptions | text | Optional |
| schedule_notes | text | Optional |
| status | enum | draft, submitted, late_submitted, revised, under_review, awarded, not_selected, rejected, withdrawn, closed |
| submitted_at | timestamp | Nullable |
| is_late | boolean | Derived or stored |
| current_version_number | integer | Default 1 |
| created_at | timestamp |  |
| updated_at | timestamp |  |

Constraints:

- Usually one active bid per `rfq_id + vendor_id`, with revisions tracked through BidVersion.

## BidVersion

Preserves bid revisions.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| bid_id | uuid |  |
| version_number | integer |  |
| total_amount_cents | integer |  |
| scope_included | text |  |
| exclusions | text |  |
| assumptions | text |  |
| schedule_notes | text |  |
| submitted_by_name | string |  |
| submitted_by_email | string |  |
| submitted_at | timestamp |  |
| change_reason | text | Nullable |

Constraint:

- Unique `bid_id + version_number`.

## BidAttachment

Files attached to a bid.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| bid_id | uuid |  |
| bid_version_id | uuid | Optional if attachments are version-specific |
| file_name | string |  |
| file_url | string | Or storage key |
| file_type | string | MIME type |
| file_size_bytes | integer |  |
| created_at | timestamp |  |

## Award

Represents selected bid/vendor decision.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| rfq_id | uuid |  |
| bid_id | uuid |  |
| vendor_id | uuid |  |
| awarded_amount_cents | integer |  |
| currency | string | Default USD |
| award_notes | text | Required |
| awarded_by_user_id | uuid |  |
| awarded_at | timestamp |  |
| status | enum | active, reversed, closed |
| reversed_by_user_id | uuid | Nullable |
| reversed_at | timestamp | Nullable |
| reversal_reason | text | Nullable |

Constraint:

- One active award per RFQ unless multi-award is explicitly enabled later.

## ChangeOrder

Represents scope/cost/schedule change approval request.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| organization_id | uuid |  |
| project_id | uuid |  |
| rfq_id | uuid | Nullable for manual CO |
| bid_id | uuid | Nullable for manual CO |
| award_id | uuid | Nullable |
| vendor_id | uuid | Nullable |
| title | string | Required |
| reason | text | Required |
| scope_description | text | Required |
| cost_impact_cents | integer | Required |
| currency | string | Default USD |
| schedule_impact_days | integer | Default 0 |
| status | enum | draft, submitted, under_review, revision_requested, approved, rejected, executed, cancelled, closed |
| created_by_user_id | uuid |  |
| submitted_at | timestamp | Nullable |
| approved_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## Approval

Represents approval action on a change order.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| change_order_id | uuid |  |
| approver_user_id | uuid | Nullable for external owner rep |
| approver_name | string |  |
| approver_email | string |  |
| decision | enum | pending, approved, rejected, revision_requested |
| comments | text | Nullable |
| decided_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## AuditEvent

Immutable event log for commercial workflow.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| organization_id | uuid |  |
| project_id | uuid | Nullable for account-level events |
| actor_user_id | uuid | Nullable for external/magic-link actor |
| actor_name | string |  |
| actor_email | string |  |
| action | string | Example: rfq.sent, bid.submitted, award.created |
| entity_type | string | rfq, bid, award, change_order, approval |
| entity_id | uuid |  |
| metadata_json | jsonb | Store relevant structured metadata |
| ip_address | string | Optional |
| user_agent | string | Optional |
| created_at | timestamp | Immutable |

Rules:

- Audit events are append-only.
- Do not hard delete audit events.
- Corrective action should create a new audit event.

## Recommended Enums

## UserRole

```text
admin
project_manager
estimator
owner_rep
observer
vendor_user
```

## RFQStatus

```text
draft
sent
viewed
questions_open
bid_submitted
under_review
awarded
closed
cancelled
reopened
```

## RFQInviteStatus

```text
pending
sent
viewed
declined
submitted
expired
cancelled
```

## BidStatus

```text
draft
submitted
late_submitted
revised
under_review
awarded
not_selected
rejected
withdrawn
closed
```

## ChangeOrderStatus

```text
draft
submitted
under_review
revision_requested
approved
rejected
executed
cancelled
closed
```

## ApprovalDecision

```text
pending
approved
rejected
revision_requested
```

## Permission Matrix

| Capability | Admin | PM | Estimator | Vendor | Owner Rep | Observer |
|---|---:|---:|---:|---:|---:|---:|
| Manage organization users | Yes | No | No | No | No | No |
| Create project | Yes | Yes | No | No | No | No |
| View project | Yes | Yes | Yes | Invited RFQs only | Assigned projects | Yes |
| Create RFQ | Yes | Yes | Yes | No | No | No |
| Send RFQ | Yes | Yes | Optional | No | No | No |
| View invited RFQ | No | No | No | Yes | No | No |
| Submit bid | No | No | No | Yes | No | No |
| Compare bids | Yes | Yes | Yes | No | No | Read-only optional |
| Award bid | Yes | Yes | Optional | No | No | No |
| Create change order | Yes | Yes | Optional | No | No | No |
| Approve change order | Yes | Configurable | No | No | Yes | No |
| View audit trail | Yes | Yes | Yes | Own actions only | Relevant COs | Read-only |

## Indexing Notes

Recommended indexes:

- `projects.organization_id`
- `project_members.project_id`
- `project_members.user_id`
- `rfqs.project_id`
- `rfqs.status`
- `rfqs.due_at`
- `rfq_invites.rfq_id`
- `rfq_invites.vendor_id`
- `rfq_invites.invited_email`
- `bids.rfq_id`
- `bids.vendor_id`
- `bids.status`
- `awards.rfq_id`
- `change_orders.project_id`
- `change_orders.status`
- `audit_events.organization_id`
- `audit_events.project_id`
- `audit_events.entity_type + entity_id`
- `audit_events.created_at`

## First Build Recommendation

Build in this order:

1. Organization, User, Project, ProjectMember.
2. Vendor.
3. RFQ and RFQAttachment.
4. RFQInvite.
5. Bid and BidAttachment.
6. Award.
7. ChangeOrder and Approval.
8. AuditEvent.
9. Clarification and BidVersion.

Clarification and BidVersion are very important, but they can come after the core RFQ/Bid path if the first sprint must stay narrow.

