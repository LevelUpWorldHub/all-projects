/**
 * Projector queue bundle — reference implementation.
 *
 * One module owns retry policy, dead-lettering, progress, and LangSmith tracing
 * for every projector queue. Projector authors only write a ProjectorHandler
 * and call setProgress at meaningful stages.
 *
 * Companion: 06-projector-queue-bundle.md (spec) and
 *            06-projector-queue-bundle.test.ts (tests).
 *
 * NOTE: this file lives in the docs/spec tree and is not currently compiled.
 * It will move to the runtime package (e.g. src/server/queue/) when the worker
 * layer is scaffolded. Imports below assume that destination.
 */

import {
  Queue,
  QueueEvents,
  Worker,
  type ConnectionOptions,
  type Job,
  type JobsOptions,
  type Processor,
} from "bullmq";

// ---------------------------------------------------------------------------
// Retry / backoff / retention defaults
// ---------------------------------------------------------------------------

export const PROJECTOR_MAX_ATTEMPTS = 5;
export const PROJECTOR_BACKOFF_BASE_MS = 2_000;

export const PROJECTOR_JOB_OPTIONS: JobsOptions = {
  attempts: PROJECTOR_MAX_ATTEMPTS,
  backoff: { type: "exponential", delay: PROJECTOR_BACKOFF_BASE_MS },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: false,
};

/**
 * Strip retry-policy fields from a per-call options object so a caller cannot
 * accidentally weaken the queue-level defaults.
 */
export function sanitizeJobOptions(opts?: JobsOptions): JobsOptions {
  if (!opts) return {};
  const { attempts, backoff, removeOnFail, ...rest } = opts;
  void attempts;
  void backoff;
  void removeOnFail;
  return rest;
}

// ---------------------------------------------------------------------------
// Progress stages
// ---------------------------------------------------------------------------

export const PROGRESS_STAGES = {
  received: 1,
  loaded: 10,
  validated: 25,
  projecting: 60,
  persisting: 85,
  done: 100,
} as const;

export type ProgressStage = keyof typeof PROGRESS_STAGES;

export function progressFor(stage: ProgressStage | number): number {
  if (typeof stage === "number") {
    if (Number.isNaN(stage)) return 0;
    return Math.max(0, Math.min(100, stage));
  }
  return PROGRESS_STAGES[stage];
}

// ---------------------------------------------------------------------------
// LangSmith tracing — env-driven, safe no-op when unconfigured
// ---------------------------------------------------------------------------

export interface TracerSpan {
  end(result: { outputs?: unknown; error?: unknown }): Promise<void>;
  runId: string | null;
}

export interface ProjectorTracer {
  start(args: {
    name: string;
    inputs: unknown;
    tags: string[];
  }): Promise<TracerSpan>;
  enabled: boolean;
}

const NOOP_SPAN: TracerSpan = {
  async end() {
    /* noop */
  },
  runId: null,
};

const NOOP_TRACER: ProjectorTracer = {
  enabled: false,
  async start() {
    return NOOP_SPAN;
  },
};

let cachedTracer: ProjectorTracer | null = null;

/**
 * Build (or return the cached) tracer. When LANGSMITH_API_KEY is unset the
 * tracer is a no-op — no client is constructed, no network calls happen.
 *
 * Tracer construction or per-call failures never throw out of this module;
 * tracing is observability, not a correctness dependency.
 */
export function getProjectorTracer(): ProjectorTracer {
  if (cachedTracer) return cachedTracer;

  const apiKey = process.env.LANGSMITH_API_KEY;
  if (!apiKey) {
    cachedTracer = NOOP_TRACER;
    return cachedTracer;
  }

  const project = process.env.LANGSMITH_PROJECT ?? "get-it-done";
  const endpoint = process.env.LANGSMITH_ENDPOINT;

  let Client: any;
  try {
    // Lazy import so dev environments without the dep don't crash on load.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Client = require("langsmith").Client;
  } catch (err) {
    // langsmith not installed — fall back to no-op rather than fail.
    // eslint-disable-next-line no-console
    console.warn("[projector-tracer] langsmith not installed, tracing disabled", err);
    cachedTracer = NOOP_TRACER;
    return cachedTracer;
  }

  const client = new Client({ apiKey, apiUrl: endpoint });

  cachedTracer = {
    enabled: true,
    async start({ name, inputs, tags }) {
      try {
        const runId = cryptoRandomId();
        const startedAt = new Date();
        await safe(() =>
          client.createRun({
            id: runId,
            name,
            run_type: "chain",
            inputs: { input: inputs },
            start_time: startedAt.getTime(),
            project_name: project,
            tags,
          }),
        );
        return {
          runId,
          async end({ outputs, error }) {
            const endTime = Date.now();
            await safe(() =>
              client.updateRun(runId, {
                end_time: endTime,
                outputs: outputs === undefined ? undefined : { output: outputs },
                error:
                  error == null
                    ? undefined
                    : error instanceof Error
                      ? `${error.message}\n${error.stack ?? ""}`
                      : String(error),
              }),
            );
          },
        };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[projector-tracer] start failed, returning noop span", err);
        return NOOP_SPAN;
      }
    },
  };
  return cachedTracer;
}

/** Reset cached tracer — used by tests. */
export function __resetTracerForTests() {
  cachedTracer = null;
}

async function safe<T>(fn: () => Promise<T> | T): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[projector-tracer] call failed", err);
    return undefined;
  }
}

function cryptoRandomId(): string {
  // Lightweight UUID v4-ish — avoids pulling a uuid dep into this bundle.
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ---------------------------------------------------------------------------
// Queue + DLQ factories
// ---------------------------------------------------------------------------

export function dlqNameFor(queueName: string): string {
  return `${queueName}.dlq`;
}

export interface CreateProjectorQueueResult<T = unknown> {
  queue: Queue<T>;
  events: QueueEvents;
  dlq: Queue<DeadLetterPayload>;
}

export interface DeadLetterPayload {
  originalQueue: string;
  originalJobId: string;
  originalName: string;
  data: unknown;
  failedReason: string;
  stacktrace: string[];
  attemptsMade: number;
  firstFailedAt: string;
  lastFailedAt: string;
  traceId: string | null;
}

export function createProjectorQueue<T = unknown>(
  name: string,
  connection: ConnectionOptions,
): CreateProjectorQueueResult<T> {
  const queue = new Queue<T>(name, {
    connection,
    defaultJobOptions: PROJECTOR_JOB_OPTIONS,
  });
  const events = new QueueEvents(name, { connection });
  const dlq = new Queue<DeadLetterPayload>(dlqNameFor(name), {
    connection,
    defaultJobOptions: {
      // DLQ entries are not retried and are kept until a replay tool removes them.
      attempts: 1,
      removeOnComplete: false,
      removeOnFail: false,
    },
  });
  return { queue, events, dlq };
}

// ---------------------------------------------------------------------------
// Projector handler / context
// ---------------------------------------------------------------------------

export interface ProjectorContext<I> {
  input: I;
  job: Job<I>;
  log: (msg: string, meta?: Record<string, unknown>) => Promise<void>;
  setProgress: (stage: ProgressStage | number) => Promise<void>;
  /** LangSmith run id for this attempt, or null when tracing is disabled. */
  traceId: string | null;
}

export type ProjectorHandler<I, O> = (ctx: ProjectorContext<I>) => Promise<O>;

export interface RegisterProjectorOptions<I, O> {
  queueName: string;
  connection: ConnectionOptions;
  handler: ProjectorHandler<I, O>;
  /** Optional concurrency cap, defaults to 1 (one job at a time per worker). */
  concurrency?: number;
  /**
   * Optional input redactor — applied before the payload is sent to LangSmith.
   * Use to strip PII / secrets. Identity by default.
   */
  redactInputs?: (input: I) => unknown;
}

export interface RegisteredProjector {
  worker: Worker;
  dlq: Queue<DeadLetterPayload>;
  /** Resolves when the worker has fully closed. */
  close(): Promise<void>;
}

export function registerProjector<I, O>(
  opts: RegisterProjectorOptions<I, O>,
): RegisteredProjector {
  const { queueName, connection, handler, concurrency = 1 } = opts;
  const redact = opts.redactInputs ?? ((x: I) => x);

  const dlq = new Queue<DeadLetterPayload>(dlqNameFor(queueName), {
    connection,
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: false,
      removeOnFail: false,
    },
  });

  // Per-job first-failure timestamps. Survives only in worker memory, which is
  // fine — if the process restarts we just record the lastFailedAt as both.
  const firstFailedAt = new Map<string, string>();

  const tracer = getProjectorTracer();

  const processor: Processor<I, O> = async (job) => {
    await job.updateProgress(progressFor("received"));

    const span = await tracer.start({
      name: `projector.${queueName}.${job.name}`,
      inputs: { jobId: job.id, attemptsMade: job.attemptsMade, data: redact(job.data) },
      tags: ["projector", queueName, job.name],
    });

    const ctx: ProjectorContext<I> = {
      input: job.data,
      job,
      traceId: span.runId,
      async log(msg, meta) {
        await job.log(meta ? `${msg} ${JSON.stringify(meta)}` : msg);
      },
      async setProgress(stage) {
        await job.updateProgress(progressFor(stage));
      },
    };

    try {
      const out = await handler(ctx);
      await job.updateProgress(progressFor("done"));
      await span.end({ outputs: out });
      return out;
    } catch (err) {
      await span.end({ error: err });
      throw err;
    }
  };

  const worker = new Worker<I, O>(queueName, processor, {
    connection,
    concurrency,
  });

  worker.on("failed", async (job, err) => {
    if (!job) return;
    const id = String(job.id);
    const now = new Date().toISOString();
    if (!firstFailedAt.has(id)) firstFailedAt.set(id, now);

    const exhausted = job.attemptsMade >= (job.opts.attempts ?? PROJECTOR_MAX_ATTEMPTS);
    if (!exhausted) return;

    const payload: DeadLetterPayload = {
      originalQueue: queueName,
      originalJobId: id,
      originalName: job.name,
      data: job.data,
      failedReason: err?.message ?? "unknown",
      stacktrace: job.stacktrace ?? [],
      attemptsMade: job.attemptsMade,
      firstFailedAt: firstFailedAt.get(id) ?? now,
      lastFailedAt: now,
      traceId: null,
    };

    try {
      await dlq.add(`${queueName}:dead`, payload, {
        jobId: `${id}:${job.attemptsMade}`,
      });
    } catch (dlqErr) {
      // Last-resort log — DLQ failure is itself a serious operational signal.
      // eslint-disable-next-line no-console
      console.error("[projector-dlq] failed to enqueue DLQ entry", {
        queueName,
        jobId: id,
        dlqErr,
      });
    } finally {
      firstFailedAt.delete(id);
    }
  });

  return {
    worker,
    dlq,
    async close() {
      await worker.close();
      await dlq.close();
    },
  };
}
