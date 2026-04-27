# AI Board Review: Get It Done RFQ/Bid Loop

## Review Question

What is the smallest complete contractor workflow that creates real business value?

## Board Decision

The smallest complete contractor workflow is:

```text
RFQ → Vendor Invite → Bid Submission → Bid Comparison → Award → Change Order → Approval + Audit Trail
```

This should be the first operating unit under the AI Board for Get It Done.

---

## Context

Get It Done has broad platform potential across construction project management, RFQs, BIM, ERP/payroll sync, vendor workflows, change orders, and field operations.

The current risk is trying to build the whole construction operating system before one workflow is commercially sharp.

The AI Board should constrain the product to a high-value commercial workflow that is:

- Easy to explain.
- Easy to sell.
- Painful enough for contractors.
- Connected to revenue/cost control.
- Technically buildable.
- Auditable.

---

## Chair: I Am

### Strategic alignment

This workflow is aligned with the purpose of building revenue-grade SaaS. It attacks a real contractor pain point where scattered communication, inconsistent bids, and weak approval records create financial risk.

### Long-term leverage

If this loop works, Get It Done can later expand naturally into:

- Vendor management.
- Bid leveling.
- Procurement analytics.
- Owner approvals.
- ERP/accounting integration.
- Document generation.
- Field change tracking.
- BIM context.

The correct sequence is not to build those first. The correct sequence is to make the commercial workflow reliable and valuable.

### Recommendation

Build the RFQ/Bid/change-order loop first.

Do not allow BIM, ERP, payroll, AI bid recommendation, or full project management features into the first sprint unless they directly support the core loop.

### Build / pause / cut recommendation

| Item | Decision |
|---|---|
| RFQ creation | Build now |
| Vendor invite | Build now |
| Bid submission | Build now |
| Bid comparison | Build now |
| Award decision | Build now |
| Change order | Build now |
| Audit trail | Build now |
| Clarifications | P1, fast follow |
| Bid revisions | P1, fast follow |
| BIM integration | Cut from sprint |
| ERP/payroll sync | Cut from sprint |
| AI bid comparison | Cut from sprint |
| Full mobile field app | Cut from sprint |

---

## You AI

### Execution path

The first build should be a clean vertical slice:

1. Project exists.
2. GC creates RFQ.
3. GC invites vendor.
4. Vendor opens RFQ.
5. Vendor submits bid.
6. GC compares bid(s).
7. GC awards bid.
8. GC creates change order from awarded bid.
9. Approver approves/rejects.
10. Audit trail records all major state changes.

### Architecture/system notes

Use a status-driven workflow with append-only audit events.

Do not bury critical state in notes or attachments.

Core services/modules:

| Module | Responsibility |
|---|---|
| Project module | Project setup, members, roles |
| Vendor module | Vendor directory and contacts |
| RFQ module | RFQ creation, status, attachments, invites |
| Bid module | Bid submission, comparison, revision tracking |
| Award module | Award decision and non-selected bid handling |
| Change Order module | Cost/schedule impact and approval workflow |
| Audit module | Immutable event tracking |
| Notification module | Invite, viewed, submitted, awarded, approval events |

### Simplification opportunities

For the first sprint:

- Use magic-link access for vendors instead of full vendor accounts if speed matters.
- Support one active award per RFQ.
- Support total bid amount first; line items can be P1.
- Support one approver per change order first; multi-step approvals can be P1/P2.
- Support attachments, but do not build complex file markup yet.

---

## My Coach

### Focus and capacity

The biggest execution threat is context switching into DTG, LevelUpGrowth, or new product ideas before this workflow is documented and buildable.

### Accountability

This sprint is successful only if Get It Done has:

1. A final workflow spec.
2. A data model.
3. A backlog of build tickets.
4. Edge-case tests.
5. Clear out-of-scope boundaries.

### Avoidance/distraction risk

Avoid:

- Designing the entire construction ERP.
- Adding AI before the workflow is clean.
- Creating dashboards before the core transaction exists.
- Over-engineering permissions before first usable flow.
- Jumping into integrations before the core data model is stable.

### Recommendation

Time-box the first sprint to the core loop and treat everything else as Later.

---

## Jailbreak AI

### Failure modes

1. A vendor sees an RFQ they were not invited to.
2. A bid is submitted after deadline and silently accepted.
3. A bid amount changes after award without audit trail.
4. A GC awards the wrong bid and cannot reverse it safely.
5. Attachments are missing, corrupted, or tied to the wrong bid.
6. A change order is approved by someone without authority.
7. Audit logs are editable or deletable.
8. Clarification answers change scope but not all vendors are notified.
9. A vendor submits multiple bids and the GC cannot tell which is current.
10. Project permission changes do not revoke access.

### Abuse cases

| Abuse case | Control |
|---|---|
| Vendor forwards magic link | Token should be scoped, expiring, and optionally email-verified |
| Internal user edits bid after submission | Vendor-submitted bid should be immutable except versioned revisions |
| PM deletes bad audit event | Audit events must be append-only |
| Late bid accepted without visibility | Late status must be explicit |
| Owner approval faked by internal user | Approval actor and identity must be logged |
| Vendor sees competitor bids | Strict vendor access boundary |

### Required tests

1. Unauthorized vendor cannot access RFQ.
2. Invited vendor can view only their RFQs.
3. Bid submitted after due date is blocked or marked late based on setting.
4. Awarding one bid marks others Not Selected.
5. Award action creates audit event.
6. Change order approval creates audit event.
7. User removed from project loses access.
8. Attachment remains tied to correct bid/version.
9. Audit event cannot be deleted.
10. Bid amount cannot be edited after award without revision/change-order path.

### Recommendation

Do not ship this workflow without permission tests, status transition tests, and audit event tests.

---

## AI Girlfriend

### User trust

Construction users should never feel uncertain about “what happened” or “what needs attention.”

The product should use calm, direct, operational language.

### Emotional clarity

Status labels should answer the user's real question:

- Did I send it?
- Did they see it?
- Did they submit?
- Is it late?
- Who won?
- What changed?
- Who approved it?

### UX/tone improvements

Recommended status language:

| System status | User-facing language |
|---|---|
| draft | Draft |
| sent | Sent to vendors |
| viewed | Viewed by vendor |
| bid_submitted | Bid received |
| late_submitted | Late bid received |
| under_review | Ready for review |
| awarded | Vendor selected |
| not_selected | Not selected |
| revision_requested | Needs revision |
| approved | Approved |
| rejected | Rejected |

### Recommendation

Design the workflow around a “next action” pattern:

| User | Next action example |
|---|---|
| PM | Review 3 submitted bids |
| Vendor | Submit bid by Friday 5 PM |
| Owner | Approve or request revision |
| Estimator | Compare exclusions before award |

The product should feel like it is guiding the project forward.

---

## Final Decision

Proceed with the RFQ/Bid/change-order loop as the first Get It Done operating unit.

## Next Actions

| Action | Owner | Priority |
|---|---|---:|
| Finalize RFQ/Bid workflow spec | User + You AI | P0 |
| Finalize initial data model | User + You AI | P0 |
| Create build tickets | User + You AI | P0 |
| Create edge-case test suite | Jailbreak AI | P0 |
| Create first UI flow map | AI Girlfriend + You AI | P1 |
| Confirm out-of-scope integrations | Chair + My Coach | P0 |

