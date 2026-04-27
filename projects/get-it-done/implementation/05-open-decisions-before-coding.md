# Get It Done Open Decisions Before Coding

## Purpose

These are the decisions that should be confirmed before implementation begins in an actual repo.

## Blocking Decisions

| Decision | Recommended default | Why |
|---|---|---|
| Auth provider | Use existing app auth if repo has one; otherwise Auth.js or Clerk | Avoid designing auth twice |
| Vendor access | Secure magic-link invite for v1 | Reduces vendor onboarding friction |
| Email provider | Resend for speed, Postmark for deliverability | Both are simple for transactional email |
| File storage | S3-compatible storage | Keeps files portable across AWS/R2/Supabase |
| Late bids | Allow but mark `late_submitted` | Preserves flexibility while keeping visibility |
| Bid revisions | P1, but schema supports versions | Avoids blocking MVP while protecting future path |
| Award reversal | Admin/PM only with reason and audit event | Needed for real-world mistakes |
| Owner approval | Internal owner-rep first if auth exists; scoped approval token later | Keeps v1 simpler |
| Line-item pricing | P1 | Total bid amount proves first workflow |
| Clarifications | P1 | Important but not required for first vertical slice |

## Technical Defaults

| Area | Default |
|---|---|
| Framework | Next.js App Router |
| Runtime | Node.js runtime for route handlers that need crypto/email/storage SDKs |
| Validation | Zod |
| DB migrations | Drizzle Kit |
| Money | Integer cents + currency |
| IDs | UUID |
| Time | timestamptz in Postgres |
| Audit metadata | jsonb |
| Files | Private bucket + signed URLs |
| Tests | Vitest for unit/integration, Playwright for E2E |

## Questions To Answer From Existing Repo

If implementing inside an existing codebase, inspect:

1. Is it already using App Router or Pages Router?
2. What auth provider/session model exists?
3. Is Drizzle already configured?
4. Is there a project/org/user schema already?
5. What file storage exists?
6. What email provider exists?
7. Are there existing service-layer conventions?
8. Are there existing permission helpers?
9. Are there existing audit/event logging patterns?
10. Is there an existing test setup?

## Non-Blocking Decisions

| Decision | Can defer until |
|---|---|
| Multi-step approvals | After first CO approval flow works |
| Vendor accounts | After magic-link workflow validates |
| AI bid comparison | After enough structured bid data exists |
| ERP integration | After CO approval data model is stable |
| BIM integration | After RFQ/Bid loop has adoption |
| Mobile app | After web workflow proves value |

