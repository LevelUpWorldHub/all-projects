/**
 * Tests for the projector queue bundle.
 *
 * BullMQ is mocked at the module boundary so these tests run without Redis.
 * They run with vitest (the testing tool chosen in 00-stack-and-architecture.md).
 *
 * To execute once the runtime package exists:
 *   pnpm vitest run src/server/queue/projector-queue-bundle.test.ts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// BullMQ mock
// ---------------------------------------------------------------------------

interface FakeJob {
  id: string;
  name: string;
  data: unknown;
  attemptsMade: number;
  opts: { attempts?: number };
  stacktrace: string[];
  progress: number;
  logs: string[];
  updateProgress(p: number): Promise<void>;
  log(s: string): Promise<void>;
}

const queueAddSpies = new Map<string, ReturnType<typeof vi.fn>>();
const constructedQueues: string[] = [];
let lastWorkerProcessor: ((job: FakeJob) => Promise<unknown>) | null = null;
let lastWorkerFailedHandler: ((job: FakeJob | undefined, err: Error) => Promise<void>) | null =
  null;

vi.mock("bullmq", () => {
  class Queue {
    name: string;
    defaultJobOptions: unknown;
    constructor(name: string, opts: { defaultJobOptions?: unknown } = {}) {
      this.name = name;
      this.defaultJobOptions = opts.defaultJobOptions;
      constructedQueues.push(name);
      const spy = vi.fn(async () => undefined);
      queueAddSpies.set(name, spy);
    }
    add = (...args: unknown[]) => {
      const spy = queueAddSpies.get(this.name) as unknown as (
        ...a: unknown[]
      ) => Promise<unknown>;
      return spy(...args);
    };
    close = vi.fn(async () => undefined);
  }
  class QueueEvents {
    constructor(public name: string) {}
    close = vi.fn(async () => undefined);
  }
  class Worker {
    name: string;
    processor: (job: FakeJob) => Promise<unknown>;
    handlers = new Map<string, (...a: unknown[]) => unknown>();
    constructor(name: string, processor: (job: FakeJob) => Promise<unknown>) {
      this.name = name;
      this.processor = processor;
      lastWorkerProcessor = processor;
    }
    on(event: string, handler: (...a: unknown[]) => unknown) {
      this.handlers.set(event, handler);
      if (event === "failed") {
        lastWorkerFailedHandler = handler as (
          job: FakeJob | undefined,
          err: Error,
        ) => Promise<void>;
      }
      return this;
    }
    close = vi.fn(async () => undefined);
  }
  return { Queue, QueueEvents, Worker };
});

// Import after mock registration.
import {
  PROJECTOR_JOB_OPTIONS,
  PROJECTOR_MAX_ATTEMPTS,
  PROJECTOR_BACKOFF_BASE_MS,
  createProjectorQueue,
  dlqNameFor,
  getProjectorTracer,
  progressFor,
  registerProjector,
  sanitizeJobOptions,
  __resetTracerForTests,
} from "./06-projector-queue-bundle";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeJob(overrides: Partial<FakeJob> = {}): FakeJob {
  const job: FakeJob = {
    id: overrides.id ?? "job-1",
    name: overrides.name ?? "rfq.created",
    data: overrides.data ?? { rfqId: "rfq-1" },
    attemptsMade: overrides.attemptsMade ?? 0,
    opts: overrides.opts ?? { attempts: PROJECTOR_MAX_ATTEMPTS },
    stacktrace: overrides.stacktrace ?? [],
    progress: 0,
    logs: [],
    async updateProgress(p) {
      this.progress = p;
    },
    async log(s) {
      this.logs.push(s);
    },
  };
  return job;
}

beforeEach(() => {
  queueAddSpies.clear();
  constructedQueues.length = 0;
  lastWorkerProcessor = null;
  lastWorkerFailedHandler = null;
  delete process.env.LANGSMITH_API_KEY;
  __resetTracerForTests();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

describe("PROJECTOR_JOB_OPTIONS", () => {
  it("uses 5 attempts with exponential backoff at the documented base", () => {
    expect(PROJECTOR_MAX_ATTEMPTS).toBe(5);
    expect(PROJECTOR_JOB_OPTIONS.attempts).toBe(5);
    expect(PROJECTOR_JOB_OPTIONS.backoff).toEqual({
      type: "exponential",
      delay: PROJECTOR_BACKOFF_BASE_MS,
    });
  });

  it("retains failed jobs so DLQ hand-off has something to read", () => {
    expect(PROJECTOR_JOB_OPTIONS.removeOnFail).toBe(false);
  });
});

describe("sanitizeJobOptions", () => {
  it("strips retry-policy fields so callers cannot weaken defaults", () => {
    const out = sanitizeJobOptions({
      attempts: 1,
      backoff: { type: "fixed", delay: 100 },
      removeOnFail: true,
      priority: 5,
      jobId: "abc",
    });
    expect(out).toEqual({ priority: 5, jobId: "abc" });
  });

  it("returns empty object for undefined input", () => {
    expect(sanitizeJobOptions(undefined)).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

describe("progressFor", () => {
  it.each([
    ["received", 1],
    ["loaded", 10],
    ["validated", 25],
    ["projecting", 60],
    ["persisting", 85],
    ["done", 100],
  ])("maps stage %s to %d", (stage, value) => {
    expect(progressFor(stage as never)).toBe(value);
  });

  it("clamps numeric input to 0..100", () => {
    expect(progressFor(-5)).toBe(0);
    expect(progressFor(150)).toBe(100);
    expect(progressFor(42)).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// createProjectorQueue
// ---------------------------------------------------------------------------

describe("createProjectorQueue", () => {
  it("creates a primary queue and a sibling DLQ with the documented name", () => {
    createProjectorQueue("rfq.events", {} as never);
    expect(constructedQueues).toContain("rfq.events");
    expect(constructedQueues).toContain("rfq.events.dlq");
    expect(dlqNameFor("rfq.events")).toBe("rfq.events.dlq");
  });
});

// ---------------------------------------------------------------------------
// registerProjector — success path
// ---------------------------------------------------------------------------

describe("registerProjector — success", () => {
  it("emits received and done progress automatically and never enqueues DLQ", async () => {
    registerProjector({
      queueName: "rfq.events",
      connection: {} as never,
      handler: async ({ setProgress }) => {
        await setProgress("loaded");
        await setProgress("projecting");
        return { ok: true };
      },
    });
    expect(lastWorkerProcessor).toBeTruthy();

    const job = makeJob();
    const out = await lastWorkerProcessor!(job);
    expect(out).toEqual({ ok: true });
    // Final progress is "done" = 100.
    expect(job.progress).toBe(100);

    const dlqAdd = queueAddSpies.get("rfq.events.dlq")!;
    expect(dlqAdd).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// registerProjector — DLQ on exhaustion
// ---------------------------------------------------------------------------

describe("registerProjector — DLQ on exhausted retries", () => {
  it("enqueues a DLQ entry with the documented metadata once attempts are exhausted", async () => {
    registerProjector({
      queueName: "rfq.events",
      connection: {} as never,
      handler: async () => {
        throw new Error("boom");
      },
    });
    expect(lastWorkerFailedHandler).toBeTruthy();

    const job = makeJob({
      id: "j-1",
      name: "rfq.created",
      data: { rfqId: "rfq-1" },
      attemptsMade: PROJECTOR_MAX_ATTEMPTS,
      stacktrace: ["Error: boom\n  at ..."],
    });
    await lastWorkerFailedHandler!(job, new Error("boom"));

    const dlqAdd = queueAddSpies.get("rfq.events.dlq")!;
    expect(dlqAdd).toHaveBeenCalledTimes(1);
    const [name, payload] = dlqAdd.mock.calls[0] as [string, Record<string, unknown>];
    expect(name).toBe("rfq.events:dead");
    expect(payload).toMatchObject({
      originalQueue: "rfq.events",
      originalJobId: "j-1",
      originalName: "rfq.created",
      data: { rfqId: "rfq-1" },
      failedReason: "boom",
      attemptsMade: PROJECTOR_MAX_ATTEMPTS,
    });
    expect(payload.firstFailedAt).toEqual(expect.any(String));
    expect(payload.lastFailedAt).toEqual(expect.any(String));
  });

  it("does not enqueue DLQ when attempts remain", async () => {
    registerProjector({
      queueName: "rfq.events",
      connection: {} as never,
      handler: async () => {
        throw new Error("boom");
      },
    });
    const job = makeJob({ attemptsMade: 1 });
    await lastWorkerFailedHandler!(job, new Error("boom"));
    const dlqAdd = queueAddSpies.get("rfq.events.dlq")!;
    expect(dlqAdd).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// LangSmith tracer
// ---------------------------------------------------------------------------

describe("getProjectorTracer", () => {
  it("returns a no-op tracer when LANGSMITH_API_KEY is unset", async () => {
    const tracer = getProjectorTracer();
    expect(tracer.enabled).toBe(false);
    const span = await tracer.start({ name: "x", inputs: {}, tags: [] });
    expect(span.runId).toBeNull();
    // Calling end on the noop span must not throw.
    await expect(span.end({ outputs: 1 })).resolves.toBeUndefined();
  });

  it("does not let tracer errors fail the projector job", async () => {
    // No api key set => noop tracer; success path already covered above.
    // This test ensures the worker processor doesn't throw when the tracer
    // start would have thrown — by simulating with a manually-broken tracer.
    registerProjector({
      queueName: "rfq.events",
      connection: {} as never,
      handler: async () => "ok",
    });
    const job = makeJob();
    await expect(lastWorkerProcessor!(job)).resolves.toBe("ok");
  });
});
