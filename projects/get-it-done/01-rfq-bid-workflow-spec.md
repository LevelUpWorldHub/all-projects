# Get It Done RFQ/Bid Workflow Spec

## Review Question

What is the smallest complete contractor workflow that creates real business value?

## Answer

The smallest complete workflow is:

```text
Project setup → RFQ creation → Vendor invite → Bid submission → Bid comparison → Award decision → Change order creation → Approval and audit trail
```

This is the smallest workflow because it creates a measurable commercial outcome:

- A contractor requests pricing.
- Vendors submit structured bids.
- The team makes a decision.
- Scope and cost become traceable.
- Change orders can be approved with evidence.

## Problem Statement

Contractors lose time and money when RFQs, bids, scope changes, attachments, approvals, and vendor communication are scattered across email, spreadsheets, PDFs, text messages, and disconnected project tools.

The cost of this problem:

- Missed or late bids.
- Incomplete bid comparisons.
- Conflicting scope assumptions.
- Slow change-order approval.
- Poor audit trail when disputes happen.
- More manual coordination for project managers and estimators.

## Goals

1. Let a GC/project manager create and send a structured RFQ.
2. Let vendors receive, view, and submit comparable bids.
3. Let the contractor compare bids and award scope.
4. Let awarded or changed scope become a change order.
5. Preserve an audit trail of who did what and when.

## Non-Goals

1. BIM-based quantity extraction.
2. ERP/payroll sync.
3. Full financial accounting.
4. Owner billing automation.
5. Full mobile offline field workflow.
6. AI bid recommendation engine.
7. Multi-project portfolio reporting.

## User Roles

| Role | Description | Core permissions |
|---|---|---|
| Admin | Company/account administrator | Manage users, vendors, templates, project settings |
| GC / Project Manager | Owns project commercial workflow | Create RFQs, invite vendors, review bids, award, create change orders |
| Estimator | Supports pricing and bid comparison | Create/edit RFQs, review bids, compare scopes, recommend award |
| Subcontractor / Vendor | Receives RFQs and submits bids | View invited RFQs, ask questions, submit/revise bids |
| Owner / Client Representative | Reviews commercial impact | View approved or pending change orders, approve/reject if invited |
| Observer | Read-only internal stakeholder | View project/RFQ/bid status without editing |

## Core Workflow

### Stage 1: Project setup

The GC creates or selects a project.

Minimum required fields:

- Project name.
- Project location.
- Project owner/client.
- Internal project number.
- Project status.

### Stage 2: RFQ creation

The GC or estimator creates an RFQ.

Minimum required fields:

- RFQ title.
- Project.
- Trade/category.
- Scope summary.
- Due date/time.
- Bid instructions.
- Attachments.
- Invited vendors.

Optional fields:

- Line items.
- Alternates.
- Exclusions requested.
- Clarification deadline.
- Site walk date.
- Required documents.

### Stage 3: Vendor invite

The system sends invites to selected vendors.

Each invite must include:

- RFQ title.
- Project summary.
- Due date.
- Scope summary.
- Attachments.
- Submission link.
- Contact/clarification channel.

### Stage 4: RFQ viewed

The system records when a vendor opens/views the RFQ.

This matters because “sent” does not mean “seen.”

### Stage 5: Vendor questions / clarifications

Vendor may submit clarification questions before the clarification deadline.

Minimum behavior:

- Questions are tied to RFQ and vendor.
- GC can answer.
- Answers can be visible to one vendor or broadcast to all invited vendors.
- All clarification activity is logged.

### Stage 6: Bid submission

Vendor submits a bid.

Minimum required fields:

- Total bid amount.
- Scope included.
- Exclusions.
- Assumptions.
- Duration or schedule notes.
- Attachments.
- Submitted by.

Optional fields:

- Line item pricing.
- Alternates.
- Unit pricing.
- Warranty notes.
- Required license/insurance docs.

### Stage 7: Bid review and comparison

GC/estimator reviews bids.

Comparison table should show:

- Vendor.
- Status.
- Total amount.
- Submitted date/time.
- Scope summary.
- Exclusions.
- Alternates.
- Attachments.
- Notes.

### Stage 8: Award decision

GC selects awarded vendor/bid.

Required:

- Awarded bid.
- Award decision note.
- Awarded amount.
- Awarded scope.
- Awarded by.
- Awarded date/time.

System behavior:

- Awarded bid status becomes `Awarded`.
- Non-awarded submitted bids become `Not Selected`.
- Audit event is recorded.

### Stage 9: Change order creation

From an awarded bid or changed scope, GC creates a change order.

Minimum required fields:

- Project.
- Related RFQ.
- Related bid/vendor.
- Title.
- Reason.
- Cost impact.
- Schedule impact.
- Scope description.
- Attachments.
- Approver.

### Stage 10: Approval

Approver reviews change order.

Possible decisions:

- Approve.
- Reject.
- Request revision.

Every approval action creates an audit event.

## Status Transitions

## RFQ Statuses

| Status | Meaning | Allowed next statuses |
|---|---|---|
| Draft | RFQ is being prepared | Sent, Cancelled |
| Sent | Invite sent to vendors | Viewed, Questions Open, Bid Submitted, Closed, Cancelled |
| Viewed | At least one vendor viewed RFQ | Questions Open, Bid Submitted, Closed, Cancelled |
| Questions Open | Clarification activity is open | Bid Submitted, Closed, Cancelled |
| Bid Submitted | At least one bid submitted | Under Review, Closed, Cancelled |
| Under Review | Internal team is comparing bids | Awarded, Closed, Cancelled |
| Awarded | A bid/vendor was selected | Change Order Created, Closed |
| Closed | RFQ closed without further action | Reopened |
| Cancelled | RFQ cancelled | Reopened |
| Reopened | RFQ reopened after closure/cancellation | Sent, Closed, Cancelled |

## Bid Statuses

| Status | Meaning | Allowed next statuses |
|---|---|---|
| Draft | Vendor started but has not submitted | Submitted, Withdrawn |
| Submitted | Bid submitted before/after due date | Revised, Under Review, Withdrawn, Rejected, Awarded, Not Selected |
| Late Submitted | Bid submitted after due date | Under Review, Rejected, Not Selected, Awarded by exception |
| Revised | Vendor revised a submitted bid | Under Review, Withdrawn, Rejected, Awarded, Not Selected |
| Under Review | Internal team is reviewing | Awarded, Not Selected, Rejected |
| Awarded | Bid selected | Change Order Created |
| Not Selected | Valid bid not chosen | Closed |
| Rejected | Bid rejected as invalid/non-compliant | Closed |
| Withdrawn | Vendor withdrew bid | Closed |
| Closed | Bid no longer active | Reopened by exception |

## Change Order Statuses

| Status | Meaning | Allowed next statuses |
|---|---|---|
| Draft | Change order being prepared | Submitted, Cancelled |
| Submitted | Sent for approval | Under Review, Revision Requested, Approved, Rejected |
| Under Review | Approver reviewing | Approved, Rejected, Revision Requested |
| Revision Requested | Approver requested changes | Draft, Submitted, Cancelled |
| Approved | Approved by required approver | Executed, Closed |
| Rejected | Rejected by approver | Closed, Revised |
| Executed | Work/cost impact accepted into project record | Closed |
| Cancelled | Change order cancelled | Reopened |
| Closed | Final state | Reopened by exception |

## Requirements

## P0: Must Have

### P0.1 Create RFQ

As a GC/project manager, I want to create a structured RFQ so vendors receive clear pricing instructions.

Acceptance criteria:

- Given I am a GC/project manager on a project, when I create an RFQ with required fields, then the RFQ is saved as Draft.
- Given required fields are missing, when I try to send the RFQ, then the system blocks sending and shows the missing fields.
- Given an RFQ is Draft, when I add vendors and send it, then the status changes to Sent and invites are recorded.

### P0.2 Vendor receives and views RFQ

As a vendor, I want to access the RFQ from an invite so I can understand the scope and submit a bid.

Acceptance criteria:

- Given I am an invited vendor, when I open the RFQ link, then I can view RFQ details and attachments.
- Given I am not invited, when I try to access the RFQ, then access is denied.
- Given I view the RFQ, when the page loads, then the system records a viewed event.

### P0.3 Vendor submits bid

As a vendor, I want to submit a structured bid so the contractor can compare my proposal.

Acceptance criteria:

- Given I am an invited vendor, when I submit required bid fields, then the bid status becomes Submitted.
- Given the RFQ due date has passed, when I submit a bid, then the bid is marked Late Submitted or blocked depending on RFQ setting.
- Given I upload attachments, when the bid is submitted, then the attachments are tied to that bid.

### P0.4 GC compares bids

As a GC/estimator, I want to compare submitted bids so I can make an award decision.

Acceptance criteria:

- Given bids have been submitted, when I open the comparison view, then I see vendor, amount, submission time, scope, exclusions, and attachments.
- Given a bid has exclusions, when I compare bids, then exclusions are visible and not hidden behind attachments.

### P0.5 Award bid

As a GC/project manager, I want to award a bid so the selected scope and cost become part of the project record.

Acceptance criteria:

- Given I have permission, when I award a bid, then the selected bid becomes Awarded.
- Given a bid is awarded, when award is confirmed, then non-selected bids are marked Not Selected.
- Given a bid is awarded, when the action completes, then an audit event records who awarded it and when.

### P0.6 Create change order

As a GC/project manager, I want to create a change order from awarded or changed scope so the cost/schedule impact can be approved.

Acceptance criteria:

- Given an awarded bid exists, when I create a change order from it, then project, vendor, RFQ, bid, amount, and scope are prefilled where possible.
- Given a change order is submitted, when an approver reviews it, then they can approve, reject, or request revision.
- Given an approval action occurs, then an audit event is recorded.

### P0.7 Audit trail

As a project stakeholder, I want an audit trail so commercial decisions can be verified later.

Acceptance criteria:

- Given a user sends an RFQ, submits a bid, awards a bid, or approves a change order, then an immutable audit event is recorded.
- Given a user views the audit trail, then they can see actor, action, timestamp, entity, and relevant metadata.

## P1: Should Have

- Vendor clarification questions and answers.
- Bid revisions.
- RFQ templates.
- Vendor contact directory.
- Line item pricing.
- Alternate pricing.
- Export to PDF.
- Internal notes on bids.

## P2: Could Have

- AI bid comparison summary.
- Bid leveling automation.
- Trade-specific templates.
- Owner-facing portal.
- Notification preferences.
- Integration hooks.

## Edge Cases

| Edge case | Expected behavior |
|---|---|
| Vendor submits after deadline | Mark Late Submitted or block based on RFQ setting |
| Duplicate vendor invite | Prevent duplicate active invite; show existing invite state |
| Vendor revises bid | Preserve previous version and show latest active version |
| Vendor withdraws bid | Mark Withdrawn and prevent award unless reopened |
| GC awards wrong bid | Allow reversal only with permission and audit note |
| RFQ cancelled after bid submitted | Preserve bids and audit trail; notify vendors |
| Bid attachment missing/corrupt | Block submission or flag bid incomplete |
| Change order created without awarded bid | Allow only as manual CO with required reason |
| Owner rejects change order | Mark Rejected and require revision or close |
| User loses project permission | Immediately revoke access to RFQs/bids/change orders |
| Clarification answer changes scope | Record broadcast and notify all invited vendors if public |
| Bid amount changes after award | Require revision/change-order flow, not silent edit |
| Audit event deletion attempt | Deny deletion; append corrective event if needed |

## Success Metrics

| Metric | First target |
|---|---|
| RFQ creation completion rate | 80% of started RFQs reach Draft saved |
| RFQ send rate | 60% of completed Draft RFQs are sent |
| Vendor view rate | 50% of invited vendors view RFQ |
| Bid submission rate | 30% of invited vendors submit bid |
| Bid comparison usage | 80% of RFQs with 2+ bids open comparison view |
| Award conversion | 50% of RFQs with bids result in award or explicit close |
| Change-order creation from awarded scope | Baseline first, then improve |
| Critical workflow error rate | 0 known P0 errors in send, submit, award, approve |

## Open Questions

| Question | Owner | Blocking? |
|---|---|---|
| Should late bids be blocked or allowed with warning by default? | Product | Yes |
| Who can award a bid: PM only, estimator too, or admin-configurable? | Product | Yes |
| Should vendors need accounts or magic-link access for first version? | Product/Engineering | Yes |
| Are owner approvals required for all change orders or configurable by project? | Product | Yes |
| Are bid amounts private from other vendors? | Product | Yes |
| Should clarification answers be vendor-private or public by default? | Product | No |
| Is PDF export P1 or needed for MVP? | Product | No |

