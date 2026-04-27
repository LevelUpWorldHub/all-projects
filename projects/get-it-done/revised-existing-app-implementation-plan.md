# Get It Done Revised Existing-App Implementation Plan

## Why This Revision Exists

The initial implementation package assumed a greenfield Next.js app.

The actual Get It Done application already exists and uses:

```text
React + Vite frontend
Express 5 API server
Drizzle ORM
PostgreSQL
Session auth with SESSION_SECRET
SSE admin events
pnpm monorepo artifact
```

Therefore, future implementation should extend the existing app instead of replacing it with a new Next.js scaffold.

## Current Built Surface

### Existing stack

- React + Vite frontend.
- Dark slate + amber theme.
- Express 5 API server.
- Drizzle ORM.
- PostgreSQL.
- Session auth using `SESSION_SECRET`.
- Base-path routing.
- SSE endpoint for live admin events.

### Existing modules

1. Lead pipeline and marketplace.
2. Kanban bid board.
3. Estimate builder.
4. Project dashboard with milestone draws and change-order log.
5. Escrow and payment engine.
6. Tasker economics fee engine in `aiPricing.ts`.

## AI Board Decision

Do not merge a greenfield Next.js foundation into the real Get It Done app as the production path.

Use the generated Next.js PR and implementation docs as:

- Architecture reference.
- Schema reference.
- Guard/permission reference.
- Audit-service reference.
- Test-case reference.

But implement against the existing React/Vite + Express 5 codebase.

## Revised RFQ/Bid Implementation Goal

Integrate the command-center workflow into the existing app:

```text
Lead / Project → Estimate / Bid → Bid Board → Award / Won → Change Order → Escrow / Payment → Audit Trail
```

The RFQ/Bid workflow should not duplicate existing bid, estimate, project, contractor, CO, invoice, escrow, or pricing models.

## Existing-To-New Mapping

| Command-center concept | Existing app area to inspect first |
|---|---|
| Project | Existing project dashboard and project tables |
| Vendor / subcontractor | Contractor company / marketplace participant tables |
| RFQ | Lead/job/project request or new RFQ layer if missing |
| Vendor invite | Marketplace interest / contractor invite mechanics |
| Bid | Existing Kanban bid board |
| Bid status | Existing New → Quoted → Under Review → Won/Lost statuses |
| Estimate | Existing estimate builder |
| Award | Existing Won status / estimate-to-bid conversion |
| Change order | Existing CO log |
| Approval | Existing CO approve/reject behavior |
| Payment hold | Existing escrow/payment engine |
| Audit event | Add if missing or align with existing event logs |
| Pricing | Existing `computeJobPricing()` in `aiPricing.ts` |

## Revised Sprint 1A

Because the real app already has many Sprint 1A-style foundations, the next engineering step is not schema-first greenfield work.

Revised Sprint 1A should be:

1. Inspect existing schema and API routes.
2. Document existing entities and how they map to the RFQ/Bid/CO loop.
3. Identify gaps only.
4. Add or harden audit/event logging.
5. Add or harden permission checks around project, bid, CO, and payment workflows.
6. Add tests for critical existing behavior:
   - background check gate.
   - bid status transitions.
   - estimate-to-bid conversion.
   - CO approval/rejection.
   - escrow hold timing.
   - fee calculation.

## Revised Sprint 1B

Implement missing RFQ/Bid workflow pieces into the existing stack.

### 1. RFQ draft creation/update

Target:

- Express route, not Next.js route handler.
- React/Vite UI in existing theme.
- Drizzle schema extension only if existing project/lead/bid tables do not already cover it.

Possible routes:

```text
POST /api/rfqs
GET /api/rfqs/:id
PATCH /api/rfqs/:id
GET /api/projects/:id/rfqs
```

Implementation rule:

Reuse existing lead/project/job entities if they already represent RFQ-like requests.

### 2. RFQ send and vendor invite flow

Target:

- Connect RFQ/job/project to contractor companies.
- Use existing marketplace/contractor interest flows where possible.
- Add secure invite token only if there is no existing invite/access pattern.

Possible routes:

```text
POST /api/rfqs/:id/send
POST /api/rfqs/:id/invites
GET /api/rfqs/:id/invites
```

### 3. Vendor RFQ view by invite token

Target:

- Contractor can view scoped RFQ/job details.
- Must not expose competitor bids.
- Must respect background-check gate where relevant.

Possible routes:

```text
GET /api/vendor/rfqs/:token
POST /api/vendor/rfqs/:token/interest
```

### 4. Bid submission from invite

Target:

- Feed into existing Kanban bid board.
- Reuse estimate builder where bid requires line items.
- Preserve existing bid statuses:
  - New
  - Quoted
  - Under Review
  - Won
  - Lost

Possible routes:

```text
POST /api/vendor/rfqs/:token/bids
POST /api/bids
PATCH /api/bids/:id/status
```

### 5. Bid comparison endpoint/view model

Target:

- Use existing bid board and estimate data.
- Add comparison view model rather than duplicating bid data.

Possible route:

```text
GET /api/rfqs/:id/bid-comparison
```

View model should include:

- Contractor/company.
- Bid status.
- Labor.
- Materials.
- Markup.
- Expenses.
- Fees.
- Client total.
- Tasker/contractor amount.
- CO exposure if applicable.
- Background-check status.
- Estimate line items.

## Revised Engineering Ticket Set

## GID-EXIST-001: Existing schema and route map

Goal:

Document the actual schema and routes for projects, leads, contractors, bids, estimates, COs, invoices, escrow, and pricing.

Deliverable:

- `docs/get-it-done/existing-app-map.md`

Acceptance criteria:

- Existing tables/entities are mapped to command-center concepts.
- Duplicates/gaps are identified.
- Recommendation is made for whether RFQ should be a new table or an extension of an existing entity.

## GID-EXIST-002: Audit and permission hardening review

Goal:

Identify where existing commercial actions need audit events and permission guards.

Actions to inspect:

- Project creation/update.
- Charge breakdown/background check gate.
- Bid creation/status change.
- Estimate-to-bid conversion.
- CO create/send/approve/reject.
- Invoice creation.
- Escrow hold transitions.
- Pricing calculation.

Acceptance criteria:

- Missing audit events are listed.
- Missing permission checks are listed.
- High-risk gaps are prioritized.

## GID-EXIST-003: RFQ model decision

Goal:

Decide if RFQ is:

1. New entity.
2. Extension of lead/job/project.
3. A specific bid-board workflow state.

Acceptance criteria:

- Decision recorded.
- Migration impact documented.
- UI impact documented.

## GID-EXIST-004: RFQ draft/send implementation

Goal:

Implement RFQ draft and send flow in existing Express/React architecture.

Acceptance criteria:

- User can create/update RFQ/job request.
- User can send/invite contractors.
- Existing marketplace/contractor model is reused where possible.
- Audit event is written.
- Tests cover permission and validation.

## GID-EXIST-005: Vendor RFQ view and bid submission

Goal:

Allow contractors to view scoped RFQ/job details and submit a bid.

Acceptance criteria:

- Contractor sees only authorized RFQ.
- Contractor can submit bid/estimate.
- Bid appears on existing Kanban board.
- Background check gate behavior is respected.
- Tests cover unauthorized access and missing background check.

## GID-EXIST-006: Bid comparison view

Goal:

Add comparison view using existing bids/estimates/pricing data.

Acceptance criteria:

- PM/admin can compare contractor bids.
- View shows financial breakdown from existing fee engine.
- View shows bid status and CO exposure where relevant.
- Contractors cannot access competitor bids.

## What To Do With PR #1

PR #1 should not be merged as-is into the production path because:

1. It creates a greenfield Next.js foundation.
2. The actual app uses React/Vite + Express 5.
3. Reviewers found blocking authorization/audit issues.
4. It may duplicate existing Get It Done entities.

Recommended action:

- Close PR #1 or keep it open only as a reference branch.
- Do not merge it into `main`.
- Start a new implementation branch from the actual existing app repo/codebase.

## Required Next Input

To implement against the real app, the AI coding agent needs the actual existing codebase.

Options:

1. Push the current React/Vite + Express app into `LevelUpWorldHub/get-it-done`.
2. Provide/upload the existing app source as a zip.
3. Tell the agent where the current code lives if it is in another repo.

