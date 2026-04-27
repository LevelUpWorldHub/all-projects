# Get It Done Risks and Decisions

## Decision Log

| Date | Decision | Rationale | Board route | Status |
|---|---|---|---|---|
| 2026-04-26 | First operating unit is RFQ/Bid/change-order loop | Smallest complete contractor workflow with real commercial value | Chair + You AI + Jailbreak | Proposed |
| 2026-04-26 | BIM integration is out of scope for first sprint | Too much complexity before value loop validation | Chair + My Coach | Proposed |
| 2026-04-26 | ERP/payroll sync is out of scope for first sprint | Integration complexity should follow workflow proof | Chair + My Coach | Proposed |
| 2026-04-26 | Copy/paste docs and email replacement is not enough; workflow must create audit trail | Auditability is core value | Jailbreak + You AI | Proposed |
| 2026-04-26 | Use status-driven workflow | Prevents ambiguous commercial states | You AI + Jailbreak | Proposed |
| 2026-04-26 | Audit events must be append-only | Protects commercial record | Jailbreak | Proposed |

## Risk Register

| Risk | Severity | Impact | Mitigation | Owner |
|---|---:|---|---|---|
| Scope sprawl into full construction OS | High | Slows delivery and weakens first value loop | Keep only RFQ/Bid/CO in Now | Chair + My Coach |
| Vendor access leak | Critical | Exposes confidential bid/project info | Strict invite permissions and tests | Jailbreak |
| Bid edited after award | Critical | Commercial/audit dispute | Immutable submitted bids, versioned revisions | Jailbreak + You AI |
| Late bids silently accepted | High | Bid process confusion/fairness issue | Explicit late status or block rule | Jailbreak |
| Missing audit event | High | Weakens trust and dispute handling | Audit event tests for all P0 actions | Jailbreak |
| Attachment tied to wrong bid | High | Decision made from wrong files | Entity-scoped attachments and tests | You AI |
| Approval by unauthorized user | Critical | Invalid change order | Role-based approval checks | Jailbreak |
| Clarification changes scope but vendors not notified | Medium | Inconsistent bids | Public clarification option and broadcast log | You AI |
| Overcomplicated vendor onboarding | Medium | Vendor drop-off | Magic-link or minimal account flow | AI Girlfriend + You AI |
| Dashboard before transaction | Medium | Looks good but does not create value | Build workflow first, dashboard second | My Coach |

## Open Product Decisions

| Question | Recommended default | Blocking? |
|---|---|---|
| Should late bids be allowed? | Allow with explicit Late Submitted status | Yes |
| Should vendors need accounts? | Start with secure magic link, allow account later | Yes |
| Who can award bids? | PM/Admin by default; Estimator configurable later | Yes |
| Are owner approvals required? | Configurable by project/change-order type | Yes |
| Can bid be edited after submission? | No direct edit; use revision/version | Yes |
| Are clarifications public by default? | Private by default, broadcast option available | No |
| Is line-item pricing P0? | No, total amount P0; line items P1 | No |

