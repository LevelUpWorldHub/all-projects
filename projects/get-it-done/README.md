# Get It Done Command Center

## Purpose

This folder is the first operating unit under the AI Board for the Get It Done app.

The current focus is the RFQ/Bid/change-order value loop:

```text
Project setup → RFQ creation → Vendor invite → Bid submission → Bid comparison → Award decision → Change order → Approval + audit trail
```

## Documents

| File | Purpose |
|---|---|
| `00-app-brief.md` | Product thesis, target users, north star, non-goals, board route |
| `01-rfq-bid-workflow-spec.md` | Full PRD/spec for the RFQ/Bid loop |
| `02-initial-data-model.md` | Initial entity model, permissions, statuses, indexing notes |
| `03-roadmap.md` | Now / Next / Later roadmap |
| `04-metrics.md` | North Star, supporting metrics, event taxonomy |
| `05-risks-decisions.md` | Risk register and decision log |
| `06-test-plan.md` | Edge-case and acceptance test plan |
| `07-ai-board-review-rfq-bid-loop.md` | Deep AI Board review |
| `08-release-notes.md` | Release/change log placeholder |
| `09-backlog.md` | First build-ticket backlog |

## Current Sprint Objective

Define and build the smallest complete contractor workflow that creates real business value:

```text
RFQ → Bid → Award → Change Order → Approval + Audit Trail
```

## Active Board Route

- Chair / I Am: keep the workflow commercially focused.
- You AI: convert into architecture, data model, and build sequence.
- My Coach: prevent overbuilding and context switching.
- Jailbreak AI: attack permissions, late bids, revisions, and audit failures.
- AI Girlfriend: make the user experience clear, calm, and confidence-building.

## First Build Order

1. Define RFQ/Bid happy path.
2. Create project and vendor foundations.
3. Build RFQ creation flow.
4. Build vendor invite flow.
5. Build vendor RFQ view.
6. Build bid submission flow.
7. Implement audit events and permissions.
8. Build bid comparison.
9. Build award flow.
10. Build change order creation.
11. Build approval flow.
12. Complete edge-case test suite.

