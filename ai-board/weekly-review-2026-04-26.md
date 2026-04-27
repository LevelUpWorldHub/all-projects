# Weekly AI Board Portfolio Review

## Date

Sunday, April 26, 2026

## Purpose

This is the first working App Health View and weekly AI Board review for the current portfolio.

The goal is to create a live operating page that can be updated every week, not a static strategy document.

Assumption status:

- Items marked **Assumption** should be confirmed or corrected.
- Items marked **Decision** are proposed operating decisions for this week.
- Items marked **Action** should become work items in the improvement pipeline.

---

## Top Portfolio Priorities

1. **Get It Done**
   - Reason: Closest to practical revenue-grade vertical SaaS.
   - This should become the operational benchmark for how the AI Board governs product execution.

2. **Dunhill Trading / DTG**
   - Reason: Highest technical leverage and strongest fit with real-time trading, quant, and options-flow expertise.
   - Requires strong Jailbreak AI review because trading systems fail through edge cases, bad data, latency, execution risk, and false-confidence signals.

3. **LevelUpGrowth**
   - Reason: Strong platform potential and directly connected to coaching, journaling, program management, personalization, and certification workflows.
   - Needs strong UX/emotional clarity review through AI Girlfriend Agent and My Coach.

---

## App Health View

| App | Stage | Status | Health | Current Focus | Main Risk | Next Milestone | Board Seat Needed | Last Review | Next Review |
|---|---|---|---:|---|---|---|---|---|---|
| Get It Done | MVP / Beta | Yellow | 3.2 / 5 | Contractor-facing bid/change-order workflows | Scope sprawl across RFQ, BIM, ERP, payroll, and field ops | Define and ship one complete RFQ-to-bid-to-change-order value loop | You AI + Jailbreak | 2026-04-26 | 2026-05-03 |
| Dunhill Trading / DTG | Spec / Prototype | Yellow | 2.9 / 5 | Options flow, GEX, alerts, strategy/backtest foundation | Overbuilding before data reliability, execution assumptions, and risk controls are proven | Define MVP trading intelligence loop and required market-data/event model | Jailbreak + You AI + Chair | 2026-04-26 | 2026-05-03 |
| LevelUpGrowth | MVP / Spec | Yellow | 3.1 / 5 | Profile/event model, journey builder, coaching workflows | Too many platform concepts before the core user transformation loop is sharp | Define one end-to-end 12-week coaching journey with journaling, milestones, and certification | AI Girlfriend + My Coach + You AI | 2026-04-26 | 2026-05-03 |
| LegalAid AI | Idea / Spec | Paused | 2.4 / 5 | Intake and document workflow | Legal risk, compliance boundaries, and trust requirements not yet governed | Create legal-risk PRD and safe workflow boundaries before buildout | Jailbreak + Chair | 2026-04-26 | 2026-05-10 |
| LevelUpAuto | Idea / Spec | Paused | 2.6 / 5 | Automation layer for growth/business systems | Undefined boundary between standalone app and automation module for LevelUpGrowth | Decide whether this is independent product or internal automation layer | Chair + You AI | 2026-04-26 | 2026-05-10 |
| Payment / Crypto Exchange Infrastructure | Spec | Red | 2.3 / 5 | Fiat onramp, settlement, ledgering | Compliance, ledger correctness, payment risk, and custody assumptions | Create risk-first architecture brief before feature work | Jailbreak + Chair | 2026-04-26 | 2026-05-10 |
| Energy Commodity Trading Engine | Idea / Spec | Yellow | 2.7 / 5 | Contracts, pricing, settlement, audit trail | Complex domain requirements and settlement correctness | Draft domain model for trades, contracts, pricing, and settlement events | You AI + Jailbreak | 2026-04-26 | 2026-05-17 |
| Political Movement / Democracy Platform | Idea | Paused | 2.2 / 5 | Governance and organizing concept | Mission scope is broad and can consume focus without revenue or validation path | Define a one-page thesis and first user/community segment | Chair + My Coach | 2026-04-26 | 2026-05-17 |

---

## Status Summary

### Green

None yet.

Reason: This is the first structured review, and no app has fully confirmed metrics, scorecards, roadmap, observability, and current execution rhythm inside this system yet.

### Yellow

- Get It Done
- DTG
- LevelUpGrowth
- Energy Commodity Trading Engine

Reason: These have meaningful strategic potential but need sharper scope, health tracking, and execution boundaries.

### Red

- Payment / Crypto Exchange Infrastructure

Reason: Payment, crypto, ledger, onramp, and compliance systems require risk-first governance before feature acceleration.

### Paused

- LegalAid AI
- LevelUpAuto
- Political Movement / Democracy Platform

Reason: These may be valuable, but this week they should not compete with the top three unless a specific decision is needed.

---

## Detailed Health Scorecards

## 1. Get It Done

### Current thesis

Get It Done is a construction/project-management SaaS focused on contractor-facing workflows, with the highest near-term value around RFQs, bids, and change orders.

### Proposed North Star

**Completed contractor bid/change-order workflows per week**

Why:

- It measures the core construction workflow rather than vanity usage.
- It can later connect to revenue, project velocity, and contractor retention.
- It keeps the product focused on an end-to-end business outcome.

### Health score

| Dimension | Score | Notes |
|---|---:|---|
| Vision clarity | 4 | Strong vertical SaaS direction, but must avoid becoming every construction tool at once. |
| User clarity | 4 | Contractor-facing priority is clear; specific user roles still need to be separated: GC, subcontractor, project manager, estimator, owner. |
| Core workflow | 3 | RFQ/Bid/change-order loop is the right core, but likely needs a defined minimum happy path. |
| Technical foundation | 3 | Assumption: architecture exists or is being built, but needs stronger module boundaries. |
| Data model | 3 | Needs durable entities for projects, RFQs, bids, vendors, scopes, change orders, approvals, files, and audit trail. |
| UX quality | 3 | Construction workflows need speed and clarity; user-facing friction is likely a risk. |
| Monetization | 4 | Clear SaaS/revenue potential if workflow saves time or improves bid/change-order accuracy. |
| Observability | 2 | Needs event tracking for RFQ created, bid sent, bid received, change order created, approval, and cycle time. |
| Automation/test coverage | 3 | Needs automated tests around status transitions, permissions, document generation, and edge cases. |

Average: **3.2 / 5**

### Status

**Yellow**

### Main risk

Scope sprawl. RFQ, BIM, ERP/payroll sync, field operations, files, approvals, and vendor management can all become separate products if not sequenced.

### Board review

#### Chair: I Am

Recommendation:

Focus Get It Done around the strongest commercial loop first: **RFQ → bid → award/selection → change order → approval/audit trail**.

Do not let BIM, ERP, payroll, or advanced integrations become the main product before the bid/change-order loop is useful.

#### You AI

Recommended execution path:

1. Define the minimum RFQ-to-bid data model.
2. Build one clean workflow for creating an RFQ and inviting vendors.
3. Add bid submission/comparison.
4. Add change-order creation from accepted scope changes.
5. Add audit trail and file/document attachments.

#### My Coach

Focus rule:

Only one Get It Done improvement theme should be active this week: **RFQ/Bid loop clarity**.

#### Jailbreak AI

Required edge cases:

- Duplicate vendor invites.
- Bid submitted after deadline.
- Partial bid submissions.
- Bid revisions.
- Permission mismatch between GC, subcontractor, and owner.
- Change order created from unapproved scope.
- Attachment/file mismatch.
- Audit trail tampering.

#### AI Girlfriend

UX guidance:

Contractors should feel, “I know exactly what needs my attention.” Use status language that reduces confusion: Draft, Sent, Viewed, Bid Submitted, Needs Review, Awarded, Change Requested, Approved.

### This week’s committed work

1. Create `00-app-brief.md` for Get It Done.
2. Create RFQ/Bid happy-path workflow.
3. Define core entities and statuses.
4. Create first edge-case test list.
5. Decide which integrations are explicitly out of scope for the next sprint.

---

## 2. Dunhill Trading / DTG

### Current thesis

DTG is a comprehensive options/derivatives trading platform focused on real-time flow analysis, GEX monitoring, strategy backtesting, alerts, and eventually copy trading.

### Proposed North Star

**Actionable trading signals validated against post-signal outcome**

Why:

- It avoids measuring raw alerts or chart views.
- It forces signal quality, not signal quantity.
- It supports backtesting, live trading review, and user trust.

Alternative near-term MVP metric:

**Number of correctly processed and classified market/flow events per trading session**

Use the alternative first if the platform is still below signal-confidence stage.

### Health score

| Dimension | Score | Notes |
|---|---:|---|
| Vision clarity | 4 | Strong vision: real-time options intelligence and execution support. |
| User clarity | 4 | Primary user is active trader/quant/operator; later segments may include subscribers and copy-trading users. |
| Core workflow | 3 | Needs MVP loop: ingest data → classify flow/GEX → generate insight → validate outcome. |
| Technical foundation | 3 | Real-time architecture likely needs careful event stream, cache, backtest, and alert boundaries. |
| Data model | 3 | Needs robust market event, option chain, flow event, Greeks, signal, trade, backtest, and outcome models. |
| UX quality | 3 | Trading UX must reduce noise and support fast decisions; risk of overwhelming dashboards. |
| Monetization | 3 | Strong potential, but monetization depends on trust, reliability, and differentiated signal quality. |
| Observability | 2 | Needs feed health, latency, dropped events, stale data, alert accuracy, and backtest integrity monitoring. |
| Automation/test coverage | 1 | Highest risk area; trading systems need replay tests, bad-data tests, and edge-case simulations. |

Average: **2.9 / 5**

### Status

**Yellow**

Could become Red if real money execution, copy trading, or automated trading is added before risk controls and data validation.

### Main risk

False confidence. A trading platform that looks intelligent but has weak data validation, bad latency, misleading signals, or untested backtests can become dangerous.

### Board review

#### Chair: I Am

Recommendation:

DTG should be governed as a high-leverage but high-risk platform. Build the intelligence layer before execution automation. Do not rush copy trading until data quality, signal validation, and user risk controls are proven.

#### You AI

Recommended execution path:

1. Define market-data/event model.
2. Build replayable ingestion pipeline.
3. Classify flow and GEX conditions.
4. Generate explainable alerts.
5. Store signal outcomes.
6. Build backtest/replay validation.
7. Only then consider execution or copy trading.

#### My Coach

Focus rule:

Do not build every trading feature at once. This week should focus on **signal pipeline integrity**, not UI sprawl.

#### Jailbreak AI

Required edge cases:

- Stale option chain.
- Missing Greeks.
- Delayed feed.
- Incorrect contract symbol mapping.
- Split/adjustment errors.
- Low-liquidity contracts.
- Sweep/block misclassification.
- Alert duplication.
- Look-ahead bias in backtesting.
- Survivorship bias in historical datasets.
- Strategy overfitting.
- Copy-trading slippage and partial fills.

#### AI Girlfriend

UX guidance:

The platform should feel calm and decisive, not like a slot machine. Prioritize confidence indicators, explanation, and risk labels over noisy alert fireworks.

### This week’s committed work

1. Create `00-app-brief.md` for DTG.
2. Define event taxonomy: market event, option-chain snapshot, flow event, signal, outcome.
3. Define MVP signal loop.
4. Create Jailbreak test suite for bad data, latency, and backtest bias.
5. Explicitly mark copy trading as Later unless core signal validation is proven.

---

## 3. LevelUpGrowth

### Current thesis

LevelUpGrowth is a 12-week coaching and growth platform with journaling, program management, certification, personalization, and recommendation memory.

### Proposed North Star

**Users completing weekly growth actions in the 12-week journey**

Why:

- It measures transformation progress, not logins.
- It supports coaching accountability.
- It can connect to retention, certification, and outcomes.

### Health score

| Dimension | Score | Notes |
|---|---:|---|
| Vision clarity | 4 | Strong transformational platform concept. |
| User clarity | 3 | Needs sharper first segment: individual user, coach, cohort leader, creator, company, or certification candidate. |
| Core workflow | 3 | 12-week journey is clear, but the core weekly loop needs to be made explicit. |
| Technical foundation | 3 | Needs unified profile/event model and journey state machine. |
| Data model | 4 | Profile/event model and recommendation memory are strong foundations if kept simple. |
| UX quality | 3 | Emotional experience is central; needs warm, guided, non-overwhelming UX. |
| Monetization | 3 | Potential through coaching programs, cohorts, certifications, or B2B growth programs. |
| Observability | 2 | Needs tracking for journal entries, action completion, streaks, milestone progress, and cohort engagement. |
| Automation/test coverage | 3 | Needs tests for journey progression, certification rules, personalization, and notifications. |

Average: **3.1 / 5**

### Status

**Yellow**

### Main risk

The platform can become too abstract if the first transformation loop is not concrete. Coaching, journaling, certification, recommendation memory, campaign board, and personalization need one simple user journey to anchor them.

### Board review

#### Chair: I Am

Recommendation:

Make LevelUpGrowth the flagship transformation platform only if the first 12-week journey is clear enough to sell, run, and complete.

#### You AI

Recommended execution path:

1. Define the 12-week program object.
2. Define user profile and growth goals.
3. Define weekly module, journal prompt, action, milestone, and certification criteria.
4. Build journey state machine.
5. Add personalization/recommendation memory after the core journey works.

#### My Coach

Focus rule:

The product should not just store journals. It should move the user through a visible transformation arc with accountability.

#### Jailbreak AI

Required edge cases:

- User skips a week.
- User wants to restart.
- User changes goal mid-program.
- Conflicting recommendations.
- Certification criteria are incomplete.
- Coach overrides automated recommendation.
- Sensitive journal content appears in wrong context.
- Notification fatigue.

#### AI Girlfriend

UX guidance:

The experience should feel like guided personal momentum. Users should feel remembered, encouraged, and clear on the next action. Avoid dashboards that feel like homework.

### This week’s committed work

1. Create `00-app-brief.md` for LevelUpGrowth.
2. Define the 12-week journey loop.
3. Define event model: profile updated, journal submitted, action completed, milestone reached, certification earned.
4. Define first onboarding flow.
5. Create AI Girlfriend review for tone, trust, and emotional clarity.

---

## Decisions Needed This Week

| Decision | Proposed answer | Owner | Board route |
|---|---|---|---|
| Which apps are active this week? | Get It Done, DTG, LevelUpGrowth | User | Chair + My Coach |
| Which apps are paused? | LegalAid AI, LevelUpAuto, Political Movement Platform | User | Chair |
| Which app gets the deepest execution sprint? | Get It Done | User | Chair + You AI |
| Should DTG include copy trading in MVP? | No, mark as Later until signal validation and risk controls are proven | User | Jailbreak + Chair |
| Should LevelUpAuto be standalone? | Not yet; treat as automation module until the parent workflow is clear | User | Chair + You AI |
| Should payment/crypto infrastructure advance? | Only after risk-first architecture and compliance boundaries are drafted | User | Jailbreak + Chair |

---

## Work Committed This Week

### Portfolio-level

- Create one folder/page per active app.
- Create app briefs for Get It Done, DTG, and LevelUpGrowth.
- Create one shared improvement pipeline with App, Initiative, Priority Score, Board Route, and Status.
- Set next weekly review for Sunday, May 3, 2026.

### Get It Done

- Define RFQ/Bid/change-order core loop.
- Define core entities and status transitions.
- List edge-case tests.
- Decide out-of-scope integrations.

### DTG

- Define market-data and signal event taxonomy.
- Define MVP signal validation loop.
- Create bad-data and backtest-bias test list.
- Keep copy trading out of MVP.

### LevelUpGrowth

- Define 12-week transformation loop.
- Define profile/event model.
- Define first onboarding and weekly action flow.
- Run AI Girlfriend tone/trust review.

---

## Intentionally Paused

| App | Reason | Revisit |
|---|---|---|
| LegalAid AI | Needs legal-risk workflow boundaries before build acceleration | 2026-05-10 |
| LevelUpAuto | Should not split focus until its relationship to LevelUpGrowth is clear | 2026-05-10 |
| Political Movement / Democracy Platform | Broad mission needs thesis and first community segment before execution | 2026-05-17 |

---

## Risks To Reduce

1. **Portfolio focus risk**
   - Too many apps competing for active build attention.
   - Mitigation: only three active apps this week.

2. **Get It Done scope risk**
   - Construction SaaS can sprawl across RFQ, BIM, ERP, payroll, vendor management, and field ops.
   - Mitigation: only RFQ/Bid/change-order loop is active.

3. **DTG false-confidence risk**
   - Trading signals may look useful before they are validated.
   - Mitigation: build signal/outcome loop before execution/copy trading.

4. **LevelUpGrowth abstraction risk**
   - Coaching platform may become too conceptual without a concrete weekly loop.
   - Mitigation: define one 12-week transformation journey.

5. **Payment/crypto compliance risk**
   - Ledger, custody, fiat onramp, and exchange flows cannot be treated like normal SaaS features.
   - Mitigation: Red status until risk-first architecture exists.

---

## Metric To Watch

### Portfolio metric

**Number of active apps with a clear Current Focus and Next Milestone**

Target for next review:

- Get It Done: clear
- DTG: clear
- LevelUpGrowth: clear
- Other apps: intentionally paused or assigned a next decision

### App-specific first metrics

| App | First metric to define |
|---|---|
| Get It Done | RFQ-to-bid workflow completion count and cycle time |
| DTG | Valid processed market/flow events and signal outcome tracking |
| LevelUpGrowth | Weekly action completion inside the 12-week journey |

---

## Learnings From This First Review

1. The AI Board needs to govern attention as much as product quality.
2. The top three apps should be active, but not all at equal depth.
3. Get It Done is the best candidate for immediate execution discipline.
4. DTG requires the strongest technical and risk review before monetization or automation.
5. LevelUpGrowth requires the strongest emotional UX and accountability design.
6. Payment/crypto infrastructure should be treated as risk-first, not feature-first.
7. Pausing apps is not abandoning them; it protects the system from dilution.

---

## Next Weekly Review Agenda

Date: Sunday, May 3, 2026

Agenda:

1. Confirm or correct lifecycle stage for each app.
2. Review whether Get It Done has a defined RFQ/Bid/change-order loop.
3. Review whether DTG has a defined market-data/event taxonomy.
4. Review whether LevelUpGrowth has a defined 12-week journey loop.
5. Move first work items from Ready to Now.
6. Decide whether any paused app needs a specific review.
7. Update app health scores.

---

## Immediate Next Actions

1. Confirm active apps for this week:
   - Get It Done
   - DTG
   - LevelUpGrowth

2. Confirm paused apps:
   - LegalAid AI
   - LevelUpAuto
   - Political Movement / Democracy Platform

3. Create the three app briefs:
   - Get It Done `00-app-brief.md`
   - DTG `00-app-brief.md`
   - LevelUpGrowth `00-app-brief.md`

4. Create the first improvement pipeline.

5. Run a deep board review on Get It Done first.

