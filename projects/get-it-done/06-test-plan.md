# Get It Done RFQ/Bid Test Plan

## Test Strategy

The first test plan focuses on:

1. Status transitions.
2. Permissions and access boundaries.
3. Commercial workflow integrity.
4. Audit event creation.
5. Edge cases around bids, deadlines, files, and approvals.

## P0 Happy Path Test

```text
Admin creates project
PM creates RFQ
PM invites vendor
Vendor views RFQ
Vendor submits bid
PM compares bid
PM awards bid
PM creates change order
Owner/approver approves change order
Audit trail shows all major actions
```

Expected:

- Every major entity is created.
- Every status transition is valid.
- Every major action creates an audit event.
- Unauthorized users cannot access the workflow.

## Permission Tests

| Test | Expected |
|---|---|
| Non-project user opens project RFQ | Access denied |
| Vendor opens RFQ without invite | Access denied |
| Vendor opens competitor bid | Access denied |
| Observer attempts to award bid | Access denied |
| Estimator attempts award when not configured | Access denied |
| Owner rep opens unassigned CO | Access denied |
| Removed project member opens old RFQ | Access denied |

## RFQ Tests

| Test | Expected |
|---|---|
| Create RFQ with required fields | Draft saved |
| Send RFQ missing required fields | Blocked with validation errors |
| Send RFQ with vendors | Status Sent, invites created |
| Duplicate vendor invite | Prevent duplicate active invite |
| Cancel RFQ after send | Status Cancelled, vendors notified |
| Reopen cancelled RFQ | Status Reopened, audit event created |

## Bid Tests

| Test | Expected |
|---|---|
| Invited vendor submits complete bid | Status Submitted |
| Vendor submits after due date when late bids allowed | Status Late Submitted |
| Vendor submits after due date when late bids blocked | Submission blocked |
| Vendor omits required bid amount | Validation error |
| Vendor withdraws bid | Status Withdrawn |
| Vendor revises bid | New BidVersion created, prior version preserved |
| Bid awarded | Status Awarded |
| Non-selected bids after award | Status Not Selected |
| Vendor tries edit after award | Blocked or requires revision/CO path |

## Change Order Tests

| Test | Expected |
|---|---|
| Create CO from awarded bid | Relevant fields prefilled |
| Submit CO with required fields | Status Submitted |
| Approver approves CO | Status Approved, audit event created |
| Approver rejects CO | Status Rejected, comments required |
| Approver requests revision | Status Revision Requested, comments required |
| Unauthorized user approves CO | Access denied |

## Audit Tests

| Test | Expected |
|---|---|
| RFQ sent | Audit event exists |
| Vendor views RFQ | Audit event exists |
| Bid submitted | Audit event exists |
| Bid awarded | Audit event exists |
| CO approved | Audit event exists |
| User attempts delete audit event | Denied |
| User attempts edit audit event | Denied |
| Corrective action needed | New audit event appended |

## File/Attachment Tests

| Test | Expected |
|---|---|
| RFQ attachment uploaded | File tied to RFQ |
| Bid attachment uploaded | File tied to bid |
| Bid revised with new attachment | Attachment tied to correct version if versioned |
| Corrupt upload | Upload fails with visible error |
| User without access opens file URL | Access denied |

## Status Transition Tests

Every status transition should be tested for:

- Valid transition succeeds.
- Invalid transition fails.
- Permission required.
- Audit event created if commercially meaningful.

## Edge Cases Requiring Product Confirmation

1. Default late-bid behavior.
2. Vendor account vs magic-link access.
3. Estimator award permission.
4. Owner approval requirement.
5. Public vs private clarifications.
6. Award reversal rules.
7. Multi-award RFQs.

