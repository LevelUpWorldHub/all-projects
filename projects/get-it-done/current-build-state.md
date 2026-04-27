# Get It Done Current Build State

## Snapshot

This file captures the current described state of the Get It Done app so the AI Board command center and implementation work stay aligned with what already exists.

## Stack and Infrastructure

- React + Vite frontend.
- Dark slate + amber theme.
- pnpm monorepo artifact.
- Express 5 API server.
- Drizzle ORM.
- PostgreSQL.
- Session auth using `SESSION_SECRET`.
- Base-path routing.
- SSE endpoint for live admin events.

## Built Product Areas

## 1. Lead Pipeline and Marketplace

Built:

- Lead capture form with contact details, project type, budget, and location.
- Marketplace job board where contractors can browse and express interest in open jobs.
- Background check gate on job creation.

Important endpoint behavior:

```text
POST /api/projects/:id/charge-breakdown
```

Returns:

```text
403 background_check_required
```

When the contractor profile is missing or `backgroundPaid = false`.

## 2. Kanban Bid Board

Built:

- Visual bid pipeline with drag-and-drop columns.
- Columns:
  - New
  - Quoted
  - Under Review
  - Won
  - Lost
- Bid creation.
- Bid status transitions.
- Links to leads and contractor companies.

## 3. Estimate Builder

Built:

- Line-item estimates.
- Labor.
- Materials.
- Markup.
- Estimate-to-bid conversion flow.

## 4. Project Dashboard With Milestone Draws and CO Log

Built:

- Schedule of Values milestones.
- Draw requests.
- Payment tracking.
- Change Order log.
- Create, send, approve, and reject COs per project.
- CO types:
  - `change_order`: 60-minute hold.
  - `milestone`: 3-day hold.
- Unapproved exposure tracking.
- Sent-but-not-approved COs shown in red.
- Financial progress bar:
  - collected vs contract + CO value.

## 5. Escrow and Payment Engine

Built:

- `invoiceType` enum:
  - `deposit`
  - `milestone`
  - `change_order`
- 3-day hold for milestones.
- 60-minute hold for change orders.
- Escrow status panel per project.
- Hold timers.
- Same-day 60-minute arrival window logic.

## 6. Tasker Economics Fee Engine

Built:

- `aiPricing.ts`.
- Canonical `computeJobPricing()` formula.

Formula:

```text
clientTotal = labor + serviceFee + trustSupportFee + fullExpenses + tip
taskerAmount = labor + cappedExpenses + tip
```

Fee rules:

- Fees apply only to labor.
- Fees do not apply to expenses.
- Fees do not apply to tips.

## AI Board Interpretation

The app already appears to have meaningful construction/commercial workflow pieces implemented.

The AI Board should not treat Get It Done as a greenfield app. It should treat it as an existing product that needs consolidation around a clean commercial operating loop.

## Alignment With New RFQ/Bid Command Center

The new command-center workflow is:

```text
Project setup → RFQ creation → Vendor invite → Vendor RFQ view → Bid submission → Bid comparison → Award decision → Change order → Approval + audit trail
```

Existing features that likely map into this:

| Existing area | New command-center mapping |
|---|---|
| Lead pipeline | Pre-RFQ demand/intake |
| Marketplace job board | Vendor/job discovery |
| Kanban bid board | Bid workflow/status layer |
| Estimate builder | Estimate-to-bid source |
| Project dashboard | Post-award project execution |
| CO log | Change-order workflow |
| Escrow/payment engine | Payment/hold layer after approval |
| Fee engine | Pricing/economics layer |

## Implementation Risk

The biggest risk is duplicate modeling.

Before adding new Drizzle tables or service logic, inspect the existing app schema and map:

- Projects.
- Leads.
- Contractors.
- Bids.
- Estimates.
- Change orders.
- Invoices.
- Escrow/payment records.
- Users/sessions.

The implementation plan should adapt to the existing schema instead of blindly replacing it.

## Next Engineering Instruction

When implementing Sprint 1A in an existing Get It Done codebase:

1. Inspect current schema and API structure.
2. Map existing entities to the RFQ/Bid command-center model.
3. Reuse existing project, contractor, bid, estimate, CO, and payment entities where possible.
4. Add only missing abstractions.
5. Preserve existing routes and UI behavior.
6. Create migration path instead of destructive rewrites.

