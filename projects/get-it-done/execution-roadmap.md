# Get It Done Execution Roadmap

## Current Gate

PR #1 must be reviewed before merge:

```text
https://github.com/LevelUpWorldHub/Get-it-done-/pull/1
```

PR #1 created the first working Get It Done app foundation:

- pnpm + Turborepo monorepo.
- React + Vite frontend.
- Express API backend.
- Drizzle + PostgreSQL.
- RFQ model.
- RFQ invite tokens.
- Bid submission.
- Bid comparison.
- Shared types.
- Dark slate + amber UI.

## Review Focus For PR #1

Before merge, review:

1. Drizzle schema correctness.
2. RFQ invite token security.
3. Bid submission flow.
4. Manual validation coverage.
5. Build scripts and workspace setup.
6. Frontend route usability.
7. Express 5 compatibility.

## Merge Rule

If review finds no blockers:

1. Merge PR #1.
2. Start Sprint 2 immediately.

If review finds blockers:

1. Patch blockers on PR #1 branch.
2. Re-run build/typecheck/tests.
3. Re-review.
4. Merge only after clean.

---

## Sprint 2: Auth, Invites, Files, and Audit Hardening

## Objective

Harden the app foundation into usable product infrastructure.

Sprint 2 should protect internal routes, make vendor invites real, support RFQ/bid attachments, expand audit coverage, improve the frontend workflow, and add tests around the critical commercial paths.

## Scope

## 1. Auth/session model

Build:

- Admin/session middleware.
- Protected internal routes.
- Request actor/session resolution.
- Internal route authorization.
- Public vendor token access remains public but tightly scoped.

Acceptance criteria:

- Internal RFQ/lead/bid management routes require a valid internal session/admin context.
- Vendor token routes do not require an internal session.
- Vendor token routes can access only the RFQ/invite associated with the token.
- Unauthorized requests return consistent error payloads.

## 2. Admin key middleware

Build:

- `ADMIN_API_KEY` middleware for admin/system routes.
- Support `X-Admin-Key`.
- Optional `Authorization: Bearer <key>`.
- Safe development behavior documented.

Acceptance criteria:

- Admin-only routes reject missing/invalid admin key.
- Admin middleware does not protect public vendor-token routes.
- Environment variables are documented in `.env.example`.

## 3. Email delivery for RFQ invites

Build:

- Email service abstraction.
- RFQ invite email sender.
- Provider environment variables.
- Resend or Postmark-ready implementation.
- Dev fallback/log mode if provider key is missing.

Acceptance criteria:

- Sending an RFQ can send invite emails.
- Invite emails include the public vendor RFQ token URL.
- Provider failures are handled without corrupting RFQ/invite state.
- `.env.example` includes required email configuration.

## 4. RFQ and bid attachments

Build:

- File attachment metadata tables.
- S3/R2-ready storage abstraction.
- RFQ attachment upload metadata.
- Bid attachment upload metadata.
- Signed URL placeholders or local/dev storage path.

Acceptance criteria:

- RFQs can reference attachments.
- Bids can reference attachments.
- File metadata is scoped to RFQ or bid.
- Vendor can only access files for their invite/RFQ.
- Internal users can access project/RFQ/bid files according to authorization.

## 5. Audit event expansion

Record audit/domain events for:

- RFQ created.
- RFQ updated.
- RFQ sent.
- Invite created.
- Invite viewed.
- Bid submitted.
- Bid comparison viewed.
- Bid accepted.
- Bid rejected.
- Attachment added.
- Auth/admin-sensitive action.

Acceptance criteria:

- Every commercial mutation writes an audit/domain event.
- Audit event payload includes actor/source, entity type, entity id, action, timestamp, and metadata.
- Audit writes happen in the same logical service flow as the mutation.

## 6. Frontend workflow polish

Build or improve:

- RFQ creation form.
- Send RFQ screen.
- Vendor invite page.
- Bid submission page.
- Bid comparison UI.
- Empty states.
- Error states.
- Loading states.
- Success confirmations.

Acceptance criteria:

- Internal user can create RFQ from the UI.
- Internal user can send RFQ/invites from the UI.
- Vendor can open token URL and submit a bid.
- Internal user can review comparison UI.
- UI keeps dark slate + amber design direction.

## 7. Tests

Add tests for:

- Route behavior.
- Manual validation.
- Invite token hashing and lookup.
- Vendor token scoping.
- Bid submission.
- Bid comparison.
- Audit event writes.

Acceptance criteria:

- Typecheck passes.
- Build passes.
- Tests pass.
- Manual verification steps are documented if any external service is mocked.

---

## Sprint 3: Change Orders and Escrow

## Objective

Extend the RFQ/Bid workflow into the commercial project lifecycle.

Sprint 3 turns accepted bids into projects, adds change orders, introduces client approval links, and creates placeholder escrow/payment logic plus a financial dashboard.

## Scope

## 1. Award bid flow

Build:

- Accept/award bid action.
- Reject/not-selected bid action.
- Bid status updates.
- Audit events.

Acceptance criteria:

- Internal user can award a submitted bid.
- Awarding one bid marks it accepted/awarded.
- Non-selected bids can be marked rejected/not selected.
- Award action is audited.

## 2. Project creation from accepted bid

Build:

- Create project from accepted bid.
- Carry over lead/RFQ/bid context.
- Carry over client/contact information.
- Carry over accepted amount.

Acceptance criteria:

- Accepted bid can generate a project.
- Project references source RFQ/bid/lead where applicable.
- Project appears in project list/dashboard.
- Creation is audited.

## 3. Change order creation from project

Build:

- Change order table/model if not already present.
- Create CO from project.
- CO fields:
  - project id.
  - number.
  - title.
  - description.
  - cost delta.
  - time delta days.
  - status.
  - client email.

Acceptance criteria:

- Internal user can create draft CO.
- Internal user can send CO for approval.
- CO appears in project dashboard/log.
- CO actions are audited.

## 4. CO approval token flow

Build:

- Public CO approval token generation.
- Token expiry.
- Public CO review page.
- Approve endpoint.
- Reject endpoint with reason.

Acceptance criteria:

- CO approval token is hard to guess.
- Token expires.
- Public client can view only the matching CO.
- Approve changes CO status to approved.
- Reject changes CO status to rejected and stores reason.
- Approval/rejection is audited.

## 5. Payment/escrow placeholder logic

Build:

- Payment/invoice placeholder model if not already present.
- Escrow hold type:
  - milestone: 3-day hold.
  - change_order: 60-minute hold.
  - deposit: configurable/no hold depending product decision.
- Hold maturity timestamp.

Acceptance criteria:

- Approved CO can generate placeholder payment/invoice.
- Change-order payment uses 60-minute hold.
- Milestone payment uses 3-day hold.
- Escrow status is visible on project financials.

## 6. Financial dashboard

Build:

- Project financial summary.
- Contract value.
- Approved CO total.
- Pending/unapproved CO exposure.
- Collected amount.
- Escrow-held amount.
- Available-for-payout amount.

Acceptance criteria:

- Financial dashboard shows contract + CO value.
- Unapproved exposure is clearly visible.
- Escrow status is visible.
- Values reconcile from source records, not hardcoded UI state.

---

## Sprint Sequencing

1. PR #1 review and merge.
2. Sprint 2: auth/session, invites, files, audit hardening, frontend polish, tests.
3. Sprint 3: award bid, project creation, change orders, CO approval token, escrow placeholder, financial dashboard.

## AI Board Notes

- Jailbreak AI should review token access, file access, audit coverage, and escrow timing.
- You AI should review service boundaries and schema migration path.
- AI Girlfriend should review vendor invite flow and bid submission clarity.
- My Coach should prevent scope expansion beyond the sprint objective.
- Chair / I Am should ensure each sprint increases commercial value, not just feature count.

