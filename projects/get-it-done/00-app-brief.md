# Get It Done App Brief

## Product Thesis

Get It Done is a construction/project-management SaaS platform that helps contractors manage the commercial workflow around RFQs, bids, awarded scope, and change orders with less confusion, fewer missed details, and a stronger audit trail.

The first value loop is:

```text
Create RFQ → Invite vendors/subcontractors → Receive bids → Compare bids → Award scope → Create change order → Approve / track audit trail
```

This is the smallest complete contractor workflow that creates real business value because it connects pre-construction pricing to real project scope changes and approvals.

## Target Users

### Primary user

**General Contractor / Project Manager**

Responsible for requesting pricing, comparing bids, awarding work, and managing change orders.

### Secondary users

**Estimator**

Needs structured scope, vendor responses, bid comparison, and historical bid context.

**Subcontractor / Vendor**

Needs a simple way to receive RFQs, ask clarifying questions, submit bids, revise bids, and track awarded or rejected scope.

**Owner / Client Representative**

Needs visibility into approved change orders, costs, and audit trail, but should not be overloaded with internal contractor workflow.

**Admin / Operations**

Needs permissions, vendor records, project setup, templates, and reporting.

## Core Job To Be Done

When a contractor needs pricing or scope changes on a project, they want to send structured RFQs, collect comparable bids, award the right vendor, and track change-order approvals so they can control cost, reduce delays, and protect the project record.

## North Star Metric

**Completed RFQ-to-award or change-order workflows per week**

## Supporting Metrics

| Metric | Why it matters |
|---|---|
| RFQs created | Measures top-of-funnel workflow adoption |
| Vendor invite acceptance/view rate | Shows whether subcontractors are engaging |
| Bid submission rate | Proves RFQs are actionable |
| Time from RFQ sent to first bid | Measures project velocity |
| Time from bid received to award decision | Measures decision efficiency |
| Change orders created from awarded scope | Connects bidding to project execution |
| Change orders approved | Measures end-to-end commercial completion |
| Late / revised / rejected bid rate | Reveals workflow friction and edge cases |

## Lifecycle Stage

**MVP / Beta**

Assumption: The product vision and modules exist, but the first value loop needs to be made explicit and implemented cleanly.

## Current Focus

RFQ → Bid → Award → Change Order loop.

## Main Risk

Scope sprawl across RFQ, BIM, ERP/payroll sync, project management, field operations, document management, vendor management, and owner reporting before the core commercial workflow is excellent.

## Strategic Decision

Get It Done should first become excellent at a narrow contractor workflow:

1. Create a structured RFQ.
2. Invite vendors/subcontractors.
3. Receive and compare bids.
4. Award scope.
5. Create and approve a change order.
6. Preserve a reliable audit trail.

## Non-Goals For First Sprint

| Non-goal | Rationale |
|---|---|
| BIM integration | Important later, but not required to prove RFQ/Bid value loop |
| ERP/payroll sync | High integration complexity; should follow workflow validation |
| Full project management suite | Risks turning MVP into broad construction OS too early |
| Advanced procurement analytics | Needs bid data volume first |
| Mobile field app | Useful later, but initial loop can be web-first |
| Owner billing automation | Should follow approved change-order workflow |

## AI Board Route

| Board seat | Role in this app |
|---|---|
| Chair / I Am | Keep the product commercially focused and prevent scope dilution |
| You AI | Turn the workflow into clear architecture, data model, and build sequence |
| My Coach | Keep execution tight and prevent app-switching or overbuilding |
| Jailbreak AI | Attack permission, bid, deadline, file, audit, and approval edge cases |
| AI Girlfriend | Make contractor-facing workflow feel simple, confident, and low-friction |

## Current Weekly Commitment

1. Finalize RFQ/Bid workflow spec.
2. Finalize initial data model.
3. Create build-ticket backlog.
4. Define edge-case test suite.
5. Decide what is explicitly out of scope for the next sprint.

