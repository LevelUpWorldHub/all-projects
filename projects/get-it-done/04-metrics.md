# Get It Done Metrics

## North Star Metric

**Completed RFQ-to-award or change-order workflows per week**

## Why This Metric

This metric measures whether Get It Done is creating real contractor value by moving commercial work from pricing request to decision and approved scope/cost change.

## L1 Product Metrics

| Metric | Definition | Why it matters |
|---|---|---|
| RFQs created | Count of RFQs created per week | Measures workflow adoption |
| RFQs sent | Count of RFQs sent to vendors | Measures movement from draft to live work |
| Vendor view rate | Vendors who view RFQ / vendors invited | Measures vendor engagement |
| Bid submission rate | Vendors who submit bid / vendors invited | Measures RFQ quality and vendor usability |
| Time to first bid | Time from RFQ sent to first bid submitted | Measures workflow speed |
| Bid comparison usage | RFQs with submitted bids where comparison view is opened | Measures decision workflow adoption |
| Award conversion | RFQs with bids that produce an award | Measures commercial completion |
| Change orders created | COs created from awarded bids or changed scope | Connects pricing to project execution |
| Change orders approved | COs approved / COs submitted | Measures end-to-end approval completion |

## L2 Diagnostic Metrics

| Area | Metrics |
|---|---|
| RFQ creation | Started RFQs, saved drafts, send attempts, validation failures |
| Vendor invite | Invites sent, bounced invites, duplicate invite attempts, expired invites |
| Vendor behavior | Views, questions, bid starts, bid submissions, withdrawals |
| Bid quality | Late bids, revised bids, bids with exclusions, bids missing attachments |
| Decision workflow | Comparison views, award actions, rejected bids, not-selected bids |
| Change orders | Draft COs, submitted COs, approvals, rejections, revision requests |
| Reliability | Workflow errors, failed notifications, failed file uploads, permission denials |

## First Event Taxonomy

| Event | Trigger |
|---|---|
| project.created | Project is created |
| vendor.created | Vendor is added |
| rfq.created | RFQ draft is created |
| rfq.updated | RFQ draft is edited |
| rfq.sent | RFQ is sent to vendors |
| rfq.viewed | Vendor views RFQ |
| rfq.closed | RFQ is closed |
| invite.sent | Vendor invite is sent |
| invite.viewed | Vendor opens invite |
| bid.started | Vendor begins bid |
| bid.submitted | Vendor submits bid |
| bid.late_submitted | Vendor submits after due date |
| bid.revised | Vendor submits revision |
| bid.withdrawn | Vendor withdraws bid |
| bid_comparison.viewed | GC/estimator opens comparison view |
| award.created | Bid is awarded |
| change_order.created | CO is created |
| change_order.submitted | CO is submitted for approval |
| approval.approved | CO is approved |
| approval.rejected | CO is rejected |
| approval.revision_requested | CO needs revision |
| audit_event.created | Audit event is recorded |

## First Targets

These are initial targets to validate once there is baseline data.

| Metric | Initial target |
|---|---:|
| RFQ creation completion rate | 80% |
| RFQ send rate | 60% |
| Vendor view rate | 50% |
| Bid submission rate | 30% |
| Bid comparison usage | 80% of RFQs with 2+ bids |
| Award conversion | 50% of RFQs with submitted bids |
| Critical workflow error rate | 0 known P0 errors |

## Dashboard Layout

1. North Star metric.
2. RFQ funnel:
   - Created.
   - Sent.
   - Viewed.
   - Bid submitted.
   - Awarded.
   - Change order created.
   - Approved.
3. Cycle time:
   - RFQ sent → first bid.
   - Bid submitted → award.
   - Change order submitted → approval.
4. Risk indicators:
   - Late bids.
   - Permission denials.
   - Failed notifications.
   - Failed uploads.
   - Audit events missing.

