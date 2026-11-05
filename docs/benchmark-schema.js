const text = { type: "string", maxLength: 160, pattern: "^[^\\u0000-\\u001f]*$" };
const num = { type: ["number", "null"], minimum: 0 }, count = { type: ["integer", "null"], minimum: 0 };
const obj = (properties) => ({
    type: "object",
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
});
const arr = (items) => ({ type: "array", items, maxItems: 100000 });
const enumeration = (...values) => ({ enum: values });
const hash = { type: "string", pattern: "^[a-f0-9]{64}$" };
const arm = enumeration("A", "B", "C", "D", "E");
const evidence = enumeration("synthetic", "measured");
const status = enumeration("supported", "unsupported", "unknown");
export const publicReportSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Portable harness benchmark PublicReport v1",
    ...obj({
        version: { const: 1 },
        evidenceScope: enumeration("none", "synthetic", "measured", "mixed"),
        empiricalHarnessCount: { type: "integer", minimum: 0 },
        replication: enumeration("unmeasured", "requires-matched-analysis"),
        arms: arr(obj({ id: arm, label: text })),
        costScope: { type: "string", maxLength: 300 },
        runs: arr(obj({
            id: text,
            task: text,
            arm,
            repeat: { type: "integer", minimum: 1 },
            harness: obj({ name: text, version: text, adapter: text, adapterVersion: text }),
            evidence,
            accounting: enumeration("api", "subscription", "unknown"),
            models: arr(obj({ role: text, provider: text, model: text, variant: text })),
            conditionHash: hash,
            artifactHash: hash,
            accepted: { type: "boolean" },
            evaluationStatus: enumeration("accepted", "failed", "invalid", "timeout"),
            issues: count,
            coverage: obj({
                requests: status,
                lineage: status,
                usage: status,
                timing: status,
                cancellation: status,
                parallel: status,
            }),
            attempts: count,
            generations: count,
            tools: count,
            delegations: count,
            cumulativeInput: count,
            peakInput: count,
            cacheRead: count,
            cacheWrite: count,
            output: count,
            estimatedModelUsd: num,
            reportedModelUsd: num,
            quotaDelta: { const: null },
            otherChargesUsd: { const: null },
            timeToEvaluationMs: num,
            peakConcurrentWorkers: count,
            lanes: arr(obj({
                id: text,
                session: text,
                parent: { type: ["string", "null"], maxLength: 160 },
                kind: enumeration("inference", "tool", "delegation", "workflow"),
                operation: enumeration(null, "primary", "compaction", "title", "generate", "evaluator"),
                status: enumeration("completed", "failed", "cancelled", "unconfirmed"),
                durationMs: num,
            })),
        })),
        groups: arr(obj({
            id: hash,
            harness: text,
            task: text,
            arm,
            evidence,
            runIds: arr(text),
            attempted: count,
            accepted: count,
            costPerAcceptedModelUsd: num,
        })),
        pairs: arr(obj({
            left: text,
            right: text,
            comparable: { type: "boolean" },
            warnings: arr(text),
            costDelta: { type: ["number", "null"] },
            latencyDeltaMs: { type: ["number", "null"] },
        })),
        evidence: arr(obj({
            runId: text,
            href: { type: "string", pattern: "^benchmark-data/[a-zA-Z0-9_-]+\\.(json|pdf|txt)$" },
            sha256: hash,
        })),
    }),
};
export function validatePublicShape(value) {
    const walk = (v, s, path) => {
        const fail = () => {
            throw Error("invalid public report: " + path);
        };
        if ("const" in s && v !== s.const)
            fail();
        if (s.enum && !s.enum.includes(v))
            fail();
        if (s.type) {
            const types = Array.isArray(s.type) ? s.type : [s.type];
            if (!types.some((t) => t === "null"
                ? v === null
                : t === "array"
                    ? Array.isArray(v)
                    : t === "object"
                        ? v !== null && typeof v === "object" && !Array.isArray(v)
                        : t === "integer"
                            ? Number.isSafeInteger(v)
                            : t === "number"
                                ? typeof v === "number" && Number.isFinite(v)
                                : typeof v === t))
                fail();
        }
        if (typeof v === "number" && s.minimum !== undefined && v < s.minimum)
            fail();
        if (typeof v === "string" &&
            ((s.maxLength !== undefined && v.length > s.maxLength) ||
                (s.pattern && !new RegExp(s.pattern, "u").test(v))))
            fail();
        if (Array.isArray(v) && s.items) {
            if (v.length > (s.maxItems ?? 100000))
                fail();
            v.forEach((x, i) => walk(x, s.items, path + "[" + i + "]"));
        }
        if (v !== null && typeof v === "object" && !Array.isArray(v) && s.properties) {
            const o = v;
            if (Object.keys(o).some((k) => !Object.hasOwn(s.properties, k)) ||
                s.required?.some((k) => !Object.hasOwn(o, k)))
                fail();
            for (const [k, child] of Object.entries(s.properties))
                if (Object.hasOwn(o, k))
                    walk(o[k], child, path + "." + k);
        }
    };
    walk(value, publicReportSchema, "root");
}
