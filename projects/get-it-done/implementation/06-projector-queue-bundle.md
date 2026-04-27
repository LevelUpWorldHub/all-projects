# Projector Queue Bundle — Spec and Reference Implementation

## Status

Reference implementation. The runtime app has not been scaffolded yet (see `00-stack-and-architecture.md` — "Background jobs: Optional queue later"). This document and its companion files (`06-projector-queue-bundle.ts`, `06-projector-queue-bundle.test.ts`) define the contract that the worker layer should adopt the moment projectors enter the codebase, so retries, dead-lettering, progress, and tracing land uniformly instead of being retro-fitted per projector.

## Goals

1. Every job in a projector queue retries with exponential backoff up to 5 attempts.
2. After max retries a job lands in a dead letter queue with enough metadata to replay or debug.
3. Projector jobs report progress at meaningful stages.
4. LangSmith tracing wraps every projector run, with a no-op fallback when LangSmith is not configured.
5. The above is delivered as one shared bundle — projectors do not re-implement any of it.

## Non-goals

- Choosing a Redis host or deployment topology.
- Defining the full set of projectors. The bundle is generic over the projector's input/output.
- Replacing OpenTelemetry. LangSmith is additive — if OTel is added later, both can coexist.

## Public surface

```ts
// 06-projector-queue-bundle.ts
export const PROJECTOR_JOB_OPTIONS;            // shared default JobsOptions
export function createProjectorQueue(name);    // Queue + QueueEvents wired with defaults
export function createDeadLetterQueue(name);   // sibling DLQ for a projector queue
export function registerProjector(opts);       // Worker factory; takes a ProjectorHandler
export type ProjectorHandler<I, O>;            // (ctx) => Promise<O>
export type ProjectorContext<I>;               // { input, job, log, setProgress, trace }
```

The only thing a projector author writes is a `ProjectorHandler`. They call `ctx.setProgress(stage)` at meaningful stages and `ctx.log(...)` for structured logs. Retries, DLQ, and tracing are wired automatically.

## Retry policy

| Setting | Value | Reason |
|---|---|---|
| `attempts` | 5 | Requirement. |
| `backoff.type` | `exponential` | BullMQ built-in. |
| `backoff.delay` | 2_000 ms | Yields ~2s, 4s, 8s, 16s, 32s — bounded under a minute total but enough to ride out transient outages. |
| `removeOnComplete` | `{ age: 3600, count: 1000 }` | Keep the last hour / 1k for inspection without unbounded growth. |
| `removeOnFail` | `false` | Failed jobs stay so the DLQ hand-off and inspector tooling have something to read. |

These live in `PROJECTOR_JOB_OPTIONS` and are applied at queue level (`defaultJobOptions`) so per-`add` callers cannot accidentally weaken them. Callers may override `priority`, `jobId`, or `delay` per call; retry/backoff fields are stripped before merge.

## Dead letter queue

When a job exhausts attempts, the worker's `failed` handler enqueues a record on `<queue>.dlq` containing:

```ts
{
  originalQueue: string;
  originalJobId: string;
  originalName: string;
  data: unknown;             // the original payload
  failedReason: string;
  stacktrace: string[];
  attemptsMade: number;
  firstFailedAt: string;     // ISO
  lastFailedAt: string;      // ISO
  traceId: string | null;    // LangSmith run id when available
}
```

DLQ entries are not auto-processed. A separate replay tool (out of scope here) reads them and re-enqueues into the original queue. The DLQ uses `removeOnComplete: false` so replays are auditable.

## Progress

`ctx.setProgress(stage)` accepts either a number (0–100) or a named stage. Named stages map to numeric progress so dashboards work either way:

```
"received"   →   1
"loaded"     →  10
"validated"  →  25
"projecting" →  60
"persisting" →  85
"done"       → 100
```

Authors are encouraged to call at least `"loaded"`, `"projecting"`, and `"done"`. The worker emits `received` and `done` automatically so a projector that forgets still has a heartbeat at the boundaries.

## LangSmith tracing

The bundle reads `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`, and `LANGSMITH_ENDPOINT` from the environment. When the key is absent the tracer becomes a no-op — handlers run unchanged, no network calls, no errors. This is required for local dev and for the docs/staging environments that will not have LangSmith provisioned on day one.

Each projector run is one trace with:

- `name`: `projector.<queueName>.<jobName>`
- `inputs`: `{ jobId, attemptsMade, data }` (data is redacted via `redactInputs` if provided)
- `outputs`: handler return value on success
- `error`: error message + stack on failure
- tags: `["projector", queueName, jobName]`

Tracing failures never fail the job. A `try/catch` around every tracer call swallows tracer errors and logs them as warnings.

## Reusability

`registerProjector` is the single integration point. Adding a new projector is:

```ts
registerProjector({
  queueName: "rfq.events",
  handler: async ({ input, setProgress }) => {
    setProgress("loaded");
    // ...
    setProgress("projecting");
    // ...
    return result;
  },
});
```

Nothing else — retries, DLQ, progress floors, tracing, structured logs are all inherited.

## Why not just configure each Worker inline?

Three projectors with copy-pasted `attempts: 5, backoff: ...` is the path to drift. The first time someone bumps one queue to 7 attempts and forgets the others, the system has silent inconsistency. A single helper that owns the policy makes that impossible.

## Tests

`06-projector-queue-bundle.test.ts` covers, with BullMQ mocked at the module boundary:

- Default options include `attempts: 5` and exponential backoff with the expected base delay.
- Per-call `add` overrides cannot weaken `attempts` or `backoff`.
- A handler that throws on every attempt produces a DLQ entry with the expected metadata shape.
- A handler that succeeds produces no DLQ entry.
- `setProgress("loaded")` resolves to numeric `10`.
- The tracer is a no-op when `LANGSMITH_API_KEY` is unset (no client constructed, handler still runs).
- Tracer errors are swallowed and do not fail the job.

## Migration notes

- New env vars: `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT` (default `get-it-done`), `LANGSMITH_ENDPOINT` (optional, defaults to LangSmith cloud). Add to `.env.example` and to the deployment secret manager when the worker layer ships.
- New runtime deps when the worker package is created: `bullmq`, `ioredis`, `langsmith`. Dev: `vitest`.
- DLQ naming convention `<queue>.dlq` is reserved — do not create application queues with a `.dlq` suffix.
- When the first projector lands, it should import from this bundle rather than instantiating `Worker` directly. Code review should reject direct `new Worker(...)` for projector queues.
