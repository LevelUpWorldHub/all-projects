# AI Board Improvement Pipeline V1

## Purpose

This is the first working improvement pipeline for the AI Board app portfolio.

Every item must connect to:

- An app.
- An initiative.
- A board route.
- A status.
- A next action.

---

## Pipeline Columns

| Status | Meaning |
|---|---|
| Inbox | Raw idea, issue, bug, or improvement |
| Triage | Needs clarification, scoring, or board route |
| Board Review | Needs AI Board seat review |
| Ready | Clear enough to execute |
| Now | Actively being worked |
| Validate | Built or drafted, needs testing or review |
| Ship / Close | Done, rejected, or intentionally closed |
| Learnings | Post-action lesson captured |

---

## Current Work Items

| ID | App | Initiative | Work Item | Status | Priority | Board Route | Next Action |
|---|---|---|---|---|---:|---|---|
| GID-001 | Get It Done | RFQ/Bid Core Loop | Define RFQ → bid → award/selection → change-order happy path | Ready | 28 | Chair + You AI + Jailbreak | Draft workflow with statuses and user roles |
| GID-002 | Get It Done | RFQ/Bid Data Model | Define core entities: project, RFQ, vendor, bid, scope, attachment, change order, approval, audit event | Ready | 27 | You AI + Jailbreak | Draft entity model and status transitions |
| GID-003 | Get It Done | RFQ/Bid Edge Cases | Create edge-case test list for deadlines, duplicate invites, revisions, permissions, files, and audit trail | Ready | 25 | Jailbreak | Convert risks into test cases |
| GID-004 | Get It Done | Scope Control | Decide which integrations are out of scope for the next sprint | Board Review | 24 | Chair + My Coach | Confirm excluded integrations: BIM, ERP, payroll, advanced field ops |
| DTG-001 | DTG | Signal Pipeline | Define MVP trading intelligence loop: ingest → classify → signal → explain → outcome | Ready | 29 | Chair + You AI + Jailbreak | Draft event flow and acceptance criteria |
| DTG-002 | DTG | Market Data Model | Define market event, option chain snapshot, flow event, Greeks, signal, trade, backtest, outcome | Ready | 28 | You AI + Jailbreak | Draft schema/event taxonomy |
| DTG-003 | DTG | Risk Controls | Create bad-data, stale-feed, latency, and look-ahead-bias test suite | Board Review | 30 | Jailbreak | Generate replay and failure-mode cases |
| DTG-004 | DTG | Roadmap Control | Move copy trading to Later until signal validation and risk controls are proven | Board Review | 26 | Chair + Jailbreak | Confirm exclusion from MVP |
| LUG-001 | LevelUpGrowth | 12-Week Journey | Define the weekly transformation loop from onboarding to certification | Ready | 29 | Chair + My Coach + AI Girlfriend | Draft journey stages, weekly actions, and milestones |
| LUG-002 | LevelUpGrowth | Profile/Event Model | Define profile, journal, action, milestone, recommendation, certification, and coach override events | Ready | 27 | You AI + Jailbreak | Draft event model |
| LUG-003 | LevelUpGrowth | Onboarding | Define first onboarding flow and emotional promise | Board Review | 25 | AI Girlfriend + My Coach | Draft tone, trust, and first-session experience |
| LUG-004 | LevelUpGrowth | Accountability | Define skipped-week, restart, goal-change, and notification-fatigue handling | Board Review | 24 | My Coach + Jailbreak + AI Girlfriend | Convert edge cases into product rules |
| PAY-001 | Payment / Crypto Exchange Infrastructure | Risk-First Architecture | Draft compliance, ledger, custody, fiat onramp, and settlement boundary brief | Triage | 30 | Chair + Jailbreak | Keep Red until risk brief exists |
| LEG-001 | LegalAid AI | Safe Legal Workflow | Define legal intake, disclaimers, document boundaries, and escalation rules | Triage | 25 | Chair + Jailbreak | Draft risk-boundary PRD before implementation |
| AUTO-001 | LevelUpAuto | Product Boundary | Decide whether LevelUpAuto is standalone or a LevelUpGrowth/internal automation module | Triage | 20 | Chair + You AI | Resolve product boundary |
| ENERGY-001 | Energy Commodity Trading Engine | Domain Model | Draft domain model for contracts, trades, pricing, settlement, and audit events | Triage | 23 | You AI + Jailbreak | Create first architecture brief |
| CIVIC-001 | Political Movement / Democracy Platform | Product Thesis | Define first user/community segment and one-page thesis | Inbox | 18 | Chair + My Coach | Clarify mission boundary before app work |

---

## Recommended Now Column

Keep active work tight.

### Now

1. GID-001: Define RFQ/Bid happy path.
2. DTG-001: Define MVP trading intelligence loop.
3. LUG-001: Define 12-week transformation loop.

### Ready, but not Now

- GID-002
- GID-003
- DTG-002
- LUG-002

### Board Review before execution

- GID-004
- DTG-003
- DTG-004
- LUG-003
- LUG-004

---

## Priority Scoring Notes

The highest-priority work is not automatically the work to do first.

This week, the order should be:

1. **Get It Done GID-001**
   - Establishes the cleanest near-term SaaS execution loop.

2. **DTG DTG-001**
   - Prevents the trading system from becoming dashboard-first instead of signal-quality-first.

3. **LevelUpGrowth LUG-001**
   - Anchors the platform to transformation outcomes instead of abstract feature modules.

---

## Board Routing Queue

### Chair: I Am

- Confirm top three active apps.
- Confirm paused apps.
- Confirm Get It Done as deepest sprint.
- Decide whether LevelUpAuto stays a module for now.

### You AI

- Draft Get It Done workflow/data model.
- Draft DTG event taxonomy.
- Draft LevelUpGrowth journey and event model.

### My Coach

- Enforce active work limits.
- Challenge app switching.
- Ensure only 3-7 work items are active this week.

### Jailbreak AI

- Attack Get It Done RFQ/Bid edge cases.
- Attack DTG data-quality, backtest, and latency failures.
- Flag payment/crypto as Red until risk-first architecture is drafted.

### AI Girlfriend

- Review LevelUpGrowth onboarding and emotional clarity.
- Review Get It Done status language for user confidence.
- Review DTG alert tone so it feels calm and risk-aware.

---

## Weekly Commitment

For the week of April 26, 2026:

| Commitment | Success definition |
|---|---|
| Complete GID-001 | RFQ/Bid happy path documented with roles, statuses, and acceptance criteria |
| Complete DTG-001 | Trading intelligence loop documented with event flow and signal outcome definition |
| Complete LUG-001 | 12-week transformation loop documented with weekly actions and milestone structure |
| Keep paused apps paused | No new build work on LegalAid AI, LevelUpAuto, Political Movement Platform unless a board decision requires it |
| Keep payment/crypto Red | No feature work before risk-first architecture brief |

---

## Definition of Done

A work item is done only when:

1. It has an app and initiative.
2. It has clear acceptance criteria.
3. The required AI Board seats have reviewed it.
4. Risks and edge cases are captured.
5. The next work item or milestone is obvious.

