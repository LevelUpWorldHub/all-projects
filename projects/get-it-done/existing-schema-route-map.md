# GID-EXIST-001 — Existing Schema & Route Map
**Get It Done · Contractor Cockpit**
_Read this before touching any model, route, or page. Do not create duplicates._

---

## 1. Monorepo Layout

```
/
├── lib/db/                        # Shared Drizzle ORM package (@workspace/db)
│   └── src/schema/
│       ├── leads.ts               → leadsTable
│       ├── bids.ts                → bidsTable, bidLineItemsTable
│       ├── projects.ts            → projectsTable, milestonesTable, changeOrdersTable, taskBookingsTable
│       ├── payments.ts            → paymentsTable, payoutsTable
│       ├── ai.ts                  → aiEventsTable, aiFlagsTable, aiScoresTable, aiScheduleProposalsTable
│       ├── tasker.ts              → taskerProfilesTable, feeConfigsTable, jobChargeBreakdownsTable
│       ├── marketplace.ts         → marketplaceJobsTable
│       └── index.ts               # re-exports everything
│
├── artifacts/api-server/          # Express 5 API (@workspace/api-server)
│   └── src/
│       ├── routes/                # see Section 3
│       ├── services/              # AI, payment, fee services
│       ├── jobs/scheduler.ts      # node-cron background jobs
│       ├── middleware/adminAuth.ts # X-Admin-Key / Bearer guard
│       └── app.ts / index.ts
│
└── artifacts/get-it-done/         # React + Vite frontend (@workspace/get-it-done)
    └── src/
        ├── pages/                 # see Section 4
        └── features/ai/           # AiSelfOpPanel, AdminScheduleProposalMonitor
```

**Import rule:** always `import { db } from "@workspace/db"` and tables from `"@workspace/db"` (NOT `/client` or `/schema` — exception: `paymentOrchestrator.ts` uses `/schema`, leave it).

---

## 2. Database Tables (PostgreSQL via Drizzle ORM)

> All PKs are `serial` integers — **never change to UUID**.

### `leads`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| client_name | text NOT NULL | |
| client_email | text | |
| client_phone | text | |
| scope_summary | text NOT NULL | |
| location | text | |
| category | text | |
| estimated_value | numeric(12,2) | |
| bid_due_date | date | |
| probability | integer | default 50 |
| source | text | default `'direct'` |
| status | text | `new` / `contacted` / `qualified` / `won` / `lost` |
| marketplace_job_id | integer | soft link to marketplace_jobs (no FK) |
| notes | text | |
| created_at / updated_at | timestamp | |

### `bids`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| lead_id | integer FK→leads.id CASCADE | |
| title | text NOT NULL | |
| total_cost / total_markup / total_tax / total_amount | numeric(12,2) | computed from line items |
| status | text | `draft` / `sent` / `accepted` / `rejected` |
| terms / exclusions / notes | text | |
| sent_at | timestamp | |
| valid_until | date | |

### `bid_line_items`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| bid_id | integer FK→bids.id CASCADE | |
| group | text | default `'General'` |
| description | text NOT NULL | |
| quantity / unit | numeric + text | |
| unit_cost | numeric(12,2) | |
| markup_percent / tax_percent | numeric(5,2) | |
| total_amount | numeric(12,2) | |
| sort_order | integer | |

### `projects`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| lead_id | integer FK→leads.id | |
| bid_id | integer FK→bids.id | |
| name | text NOT NULL | ← field is `name`, NOT `title` |
| client_name / client_email / client_phone | text | |
| location | text | |
| contract_value / current_value | numeric(12,2) | |
| status | text | `active` / `completed` / `on_hold` / `cancelled` |
| start_date / end_date | date | |
| notes | text | |

### `milestones`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id CASCADE | |
| name | text NOT NULL | |
| amount | numeric(12,2) | |
| acceptance_criteria | text | |
| planned_date / actual_date | date | |
| is_paid | boolean | default false |
| status | text | `pending` / `in_progress` / `complete` |
| sort_order | integer | |

### `change_orders`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id CASCADE | |
| milestone_id | integer FK→milestones.id | nullable |
| number | integer NOT NULL | sequential per project |
| title / description | text NOT NULL | |
| change_type | text | `added_work` / `material_change` / `unforeseen_condition` / `owner_request` |
| cost_delta | numeric(12,2) | |
| time_delta_days | integer | |
| status | text | `draft` / `sent` / `approved` / `rejected` |
| approved_at / rejected_at | timestamp | |
| approval_deadline | date | |
| approval_token | text UNIQUE | 48-char hex, set by POST /change-orders/:id/approval-link |
| approval_token_expires_at | timestamp | set to +30 days on link generation |
| client_email | text | |
| notes | text | |

### `payments`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id CASCADE | |
| milestone_id | integer FK→milestones.id | nullable |
| change_order_id | integer FK→change_orders.id | nullable |
| amount | numeric(12,2) NOT NULL | |
| invoice_type | text | `'milestone'` (3-day hold) / `'change_order'` (60-min hold) / `'deposit'` |
| method | text | `card` / `ach` / `wire` / `check` / `demo` |
| processor_payment_id | text | |
| escrow_held | boolean | true while in hold |
| available_at | timestamp | when hold matures |
| processed_at | timestamp | |
| payout_id | integer FK→payouts.id | set when swept into a batch |
| dispute_opened_at / dispute_reason / dispute_resolved_at | mixed | |

### `payouts`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| contractor_company_id | integer NOT NULL | no FK (external system) |
| total_amount | numeric(12,2) | |
| status | text | `pending` / `processing` / `paid` / `failed` / `blocked` |
| scheduled_for | timestamp | |
| processed_at | timestamp | |
| processor_payout_id | text | |
| failure_reason | text | |
| risk_score | numeric(4,3) | 0–1 |
| risk_flags | text | |

### `ai_events`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id CASCADE | |
| company_id | integer | |
| event_type | text NOT NULL | e.g. `co_approved`, `payment_held`, `schedule_slip` |
| entity_type / entity_id | text + integer | |
| amount | numeric(12,2) | |
| metadata | jsonb | |

### `ai_flags`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id CASCADE | |
| company_id | integer | |
| flag_type / code | text | |
| severity | text | `info` / `warning` / `critical` |
| title / detail | text | |
| source_event_id | integer FK→ai_events.id | |
| resolved | boolean | default false |
| resolved_at | timestamp | |

### `ai_scores`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id | |
| company_id | integer | |
| score_type | text | `cost_risk` / `schedule_risk` / `project_risk` / `payout_risk` |
| value | real | 0.0–1.0 |
| details | jsonb | |

### `ai_schedule_proposals`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id CASCADE | |
| created_by | text | default `'ai_system'` |
| rationale | text NOT NULL | |
| changes | jsonb NOT NULL | proposed milestone reorder |
| accepted / accepted_at | boolean + timestamp | |
| auto_applied | boolean | true if applied by risk threshold |
| auto_applied_reason | text | `'low_risk'` / `'tasker_opt_in'` |
| risk_score_at_creation | real | snapshot 0–1 |

### `tasker_profiles`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| contractor_company_id | integer UNIQUE NOT NULL | |
| background_paid / background_paid_at / background_fee | mixed | |
| auto_accept_schedule | boolean | AI proposals apply without review |
| preferred_rate_low / preferred_rate_high | real | |

### `fee_configs`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| market_city / market_state / category | text NOT NULL | |
| service_fee / trust_support_fee | real | |
| max_expense | real | |
| dynamic_factors | jsonb | AI-managed rate ranges, demand level |
| ai_updated_at | timestamp | |

### `job_charge_breakdowns`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id CASCADE | |
| base_labor_amount / tasker_amount | numeric(12,2) | |
| platform_service_fee / platform_trust_support_fee | numeric(12,2) | |
| client_total / expense_total / capped_expense_total / tip | numeric(12,2) | |
| category / market_city / market_state | text | |
| fee_config_id | integer FK→fee_configs.id | |

### `marketplace_jobs`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| title / client_name / location / category / description | text NOT NULL | |
| estimated_budget | numeric(12,2) | |
| bids_due | date | |
| is_claimed | boolean | default false |
| posted_at | timestamp | |

### `task_bookings`
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| project_id | integer FK→projects.id CASCADE | |
| contractor_company_id | integer NOT NULL | |
| date / window_start / window_end | timestamp | |
| same_day | boolean | |
| status | text | `requested` / `confirmed` / `completed` / `cancelled` |
| notes | text | |

---

## 3. API Route Map

**Base:** all routes served under `/api` prefix via Express.
**Auth:** routes under `/api/admin/*` require `X-Admin-Key: <ADMIN_API_KEY>` header or `Authorization: Bearer <key>`.

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Liveness probe |
| GET | `/api/dashboard/stats` | Summary counts for home dashboard |

### Leads
| Method | Path | Description |
|---|---|---|
| GET | `/api/leads` | List all leads |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/:id` | Get lead |
| PATCH | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |

### Bids
| Method | Path | Description |
|---|---|---|
| GET | `/api/bids` | List bids (optionally ?leadId=) |
| POST | `/api/bids` | Create bid |
| GET | `/api/bids/:id` | Get bid |
| PATCH | `/api/bids/:id` | Update bid |
| DELETE | `/api/bids/:id` | Delete bid |
| GET | `/api/bids/:id/line-items` | Get line items for bid |
| POST | `/api/bids/:id/line-items` | Add line item |
| PATCH | `/api/bid-line-items/:id` | Update line item |
| DELETE | `/api/bid-line-items/:id` | Delete line item |

### Projects
| Method | Path | Description |
|---|---|---|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PATCH | `/api/projects/:id` | Update project |
| GET | `/api/projects/:id/milestones` | List milestones |
| POST | `/api/projects/:id/milestones` | Add milestone |
| PATCH | `/api/milestones/:id` | Update milestone |
| GET | `/api/projects/:id/change-orders` | List change orders |
| POST | `/api/projects/:id/change-orders` | Create change order |
| GET | `/api/change-orders/:id` | Get single CO |
| PATCH | `/api/change-orders/:id` | Update CO |
| GET | `/api/projects/:projectId/escrow` | Escrow summary for project |
| GET | `/api/projects/:projectId/charge-breakdown` | Fee breakdown |
| POST | `/api/projects/:projectId/charge-breakdown` | Compute fee breakdown |
| GET | `/api/projects/:projectId/ai-insights` | Per-project AI insights |

### Change Order Client Approval (public — no auth)
| Method | Path | Description |
|---|---|---|
| POST | `/api/change-orders/:id/approval-link` | Generate token + shareable URL (sets 30-day expiry) |
| GET | `/api/co-approval/:token` | Public: fetch CO details by token |
| POST | `/api/co-approval/:token/approve` | Client approves |
| POST | `/api/co-approval/:token/reject` | Client rejects (body: `{ reason }`) |

### Payments & Escrow
| Method | Path | Description |
|---|---|---|
| POST | `/api/payments/checkout` | Create payment (starts escrow hold) |
| POST | `/api/payments/:paymentId/dispute` | Open dispute |
| DELETE | `/api/payments/:paymentId/dispute` | Resolve/drop dispute |

### Pro / Quick Bid
| Method | Path | Description |
|---|---|---|
| POST | `/api/pro/projects/:projectId/quick-bid` | AI quick-bid generation |
| GET | `/api/pro/projects/:projectId/change-orders` | CO list (pro view) |
| POST | `/api/pro/projects/:projectId/change-orders` | Create CO (pro view) |
| GET | `/api/pro/projects/:projectId/ai-insights` | AI insights (pro view) |

### Marketplace
| Method | Path | Description |
|---|---|---|
| GET | `/api/marketplace/jobs` | List open marketplace jobs |
| POST | `/api/marketplace/jobs/:id/claim` | Claim a marketplace job |

### Same-Day / Task Bookings
| Method | Path | Description |
|---|---|---|
| GET | `/api/contractors/:contractorId/same-day-windows` | Available windows |
| POST | `/api/projects/:projectId/same-day-booking` | Create booking |
| GET | `/api/projects/:projectId/same-day-bookings` | List bookings for project |
| PATCH | `/api/bookings/:bookingId/status` | Update booking status |

### Tasker Profile & Fee Engine
| Method | Path | Description |
|---|---|---|
| GET | `/api/tasker-profile/:companyId` | Get tasker profile |
| PATCH | `/api/tasker-profile/:companyId` | Update profile |
| POST | `/api/tasker-profile/:companyId/background` | Pay background check fee |
| GET | `/api/tasker-profile/:companyId/rate-suggestion` | AI rate suggestion |
| GET | `/api/fee-config` | Get fee config (?city=&state=&category=) |
| POST | `/api/fee-config` | Create fee config |
| PUT | `/api/fee-config/:id` | Update fee config |

### AI Schedule Proposals
| Method | Path | Description |
|---|---|---|
| GET | `/api/projects/:projectId/ai-schedule-proposals` | List proposals |
| POST | `/api/projects/:projectId/ai-schedule-proposals` | Generate proposal |

### Admin (requires `X-Admin-Key` header)
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/ai-events` | Paginated AI event log |
| POST | `/api/admin/ai-events` | Log a domain event |
| GET | `/api/admin/ai-flags` | List flags (?projectId=&severity=&resolved=) |
| PATCH | `/api/admin/ai-flags/:id/resolve` | Resolve flag |
| POST | `/api/admin/ai-dashboard/flags/:id/resolve` | Resolve flag (alt path) |
| GET | `/api/admin/ai-scores` | List scores |
| GET | `/api/admin/ai-dashboard` | Summary counts |
| GET | `/api/admin/ai-dashboard/summary` | Flags + score summary for UI |
| GET | `/api/admin/ai-dashboard/projects/:projectId` | Per-project admin view |
| POST | `/api/admin/run-anomaly-detection` | Trigger heuristic scan |
| GET | `/api/admin/payouts` | List payouts |
| POST | `/api/admin/payouts/process` | Trigger escrow sweep |
| GET | `/api/admin/schedule-proposals` | All schedule proposals |
| GET | `/api/admin/job-routing` | Job routing queue |
| POST | `/api/admin/update-fee-configs` | Trigger nightly fee update |
| GET | `/api/admin/self-op-status` | AI self-op system status |
| GET | `/api/admin/cron-log` | Last 50 scheduler run entries |
| GET | `/api/ai/events/stream` | SSE stream for real-time AI events |

---

## 4. Frontend Pages & Routes (Wouter)

| Path | Component file | Description |
|---|---|---|
| `/` | `dashboard.tsx` | Home — stats cards, recent activity |
| `/board` | `bid-board.tsx` | Kanban bid pipeline board |
| `/leads` | `leads.tsx` | Lead list + create |
| `/leads/:id` | `lead-detail.tsx` | Lead detail, linked bids |
| `/bids` | `bids.tsx` | Bid list |
| `/bids/:id` | `bid-editor.tsx` | Estimate builder with line items |
| `/projects` | `projects.tsx` | Project list |
| `/projects/:id` | `project-dashboard.tsx` | Milestone draws, escrow, AI insights |
| `/projects/:id/change-orders` | `change-orders.tsx` | CO log with Client Link button |
| `/marketplace` | `marketplace.tsx` | Open marketplace jobs |
| `/admin/ai` | `admin-ai-dashboard.tsx` | Risk scores, flags, cron log, self-op panel |
| `/co-review/:token` | `ClientCoApproval.tsx` | **Public** client CO approval page (no app shell) |

---

## 5. Background Scheduler (`scheduler.ts`)

| Schedule | Job | What it does |
|---|---|---|
| Every 5 min | `escrow-sweep` | `schedulePayouts()` + `executePayouts()` — releases matured holds |
| 2:00 AM UTC | `nightly-fees` | `runNightlyFeeConfigUpdate()` — AI fee heuristic update |
| 3:00 AM UTC | `nightly-anomaly` | `runProjectAnomalyDetection()` + `proposeScheduleChangesForProject()` on all active projects |

Run history is kept in an in-memory ring buffer (last 50). Exposed at `GET /api/admin/cron-log`.

---

## 6. Key Business Rules (do not break)

- **Escrow holds:** `invoice_type='milestone'` → 3-day hold; `invoice_type='change_order'` → 60-min hold.
- **CO approval tokens:** 48-char hex, expire 30 days after generation. All three public CO routes check expiry.
- **Admin key:** `ADMIN_API_KEY` env secret. Dev passthrough if unset (warns at startup). Passed via `X-Admin-Key` header.
- **Drizzle select gotcha:** never `db.select({ col })` with `leftJoin` — always `db.select()` (full), then pick in JS.
- **No Zod in API routes** — manual type-cast + guard validation only.
- **`projectsTable.name`** — the project name field is `name`, not `title`.
- **DB schema changes** — add columns via `psql $DATABASE_URL` directly (drizzle push hangs on interactive prompts for unique constraints). Then update the Drizzle schema file to match.
- **Build command:** `cd artifacts/api-server && node ./build.mjs`

---

## 7. What Does NOT Exist Yet (safe to add)

- RFQ (Request for Quote) model and workflow — no `rfqs` table exists
- Subcontractor / vendor invite system
- Client portal (beyond the single CO approval page)
- Invoice PDF generation
- Stripe / real payment processor integration (all payments are `method='demo'`)
- Email delivery (approval links are clipboard-only today)
- Multi-company / multi-user auth (no session or user table exists)
