# Local report first

The bundled analyzer reads the Claude history files you select and writes a JSON report in a local directory. It uses Node built-ins, with no network client, model call, collector, server or upload command. No OpenTelemetry installation is needed. Do the following in your own terminal, outside Claude, for the strongest separation from conversation:

```sh
node context-audit/scripts/cli.mjs discover --claude-home "$HOME/.claude"
# Open the printed inventory path locally; choose the transcript you want analyzed.
node context-audit/scripts/cli.mjs analyze \
  --claude-home "$HOME/.claude" --transcript /absolute/path/to/session.jsonl
```

The command prints the report location, not its contents. By default it is `CLAUDE_HOME/context-audit-data/reports/TIMESTAMP-ID.json`. Discovery inventories and installation previews use neighboring `discovery/` and `previews/` folders. `--out FILE` chooses a different local file. These paths may identify a user/project if copied into chat. Never put real reports in the public presentation, a repository or a synced/shared directory without following your organization’s policy.

## What the report tells you

- `coverage`: which selected files and formats contributed, malformed/skipped data, known limitations and usage source. Missing records mean unknown coverage.
- `metrics`: observed call counts, input summed across calls, maximum fully reported request, cache-inclusive input accounting, output and cost where available. Null means unknown; a known subtotal is incomplete. Peak input is not resident context. Costs are estimates, not subscription billing.
- `requests`: per-call usage and source file/line anchors for local investigation. IDs, model names and paths can identify internal work.
- `findings`: candidate optimization packages, evidence anchors and effort/tradeoff explanations. Heuristics prioritize investigation; they do not establish waste, savings, attention weights or instruction compliance.

Open the JSON in a local editor with JSON formatting. Reading it needs no model connection. Original history is read, never rewritten or deleted by this analyzer.

## Optional help from Claude

```sh
node context-audit/scripts/cli.mjs summary --report /absolute/path/to/report.json
```

This writes a private `summary-REPORT.json` beside the report, without displaying its contents. Review it in your local editor. It contains only allowlisted numeric aggregates, fixed coverage explanations and known package IDs. Paths, identifiers, raw text, arbitrary model names, finding detail and per-request records are omitted. Missing/invalid numeric values stay null. It is reduced data, not guaranteed anonymous: aggregate costs and usage patterns can still be sensitive.

If policy permits and you choose to share, provide that reduced file to `/context-audit` or explicitly authorize `summary --report FILE --print`. Only `--print` emits its contents to tool output. Claude interpreting it uses the normal approved Claude/model connection. Running `/context-audit` does not turn Claude into an offline model or prevent its ordinary network activity. The skill defaults to returning the report path and waiting for your sharing choice.

## Protections included in the package

| Surface                              | Default protection                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reports, inventories, previews       | Local file output; POSIX files 0600; new generated directories 0700                                                                                 |
| Previews and rollback manifests      | Kept private because full existing settings may include credentials                                                                                 |
| Output paths                         | Symbolic links, hardlinked files and nonregular targets refused; report writes replace atomically                                                   |
| Enterprise telemetry and permissions | Preserved; no exporter, endpoint, logging flags or auto-approval change                                                                             |
| Evidence/measurement hooks           | Fixed event/tool categories, timestamps and explicit numeric/boolean completion metadata; no command/output, raw tool-use ID or arbitrary tool name |
| Project storage                      | Owned `.context-audit/` directories 0700, data files 0600; internal `.gitignore` created if absent                                                  |
| Traces                               | At most 20 trace files, each at most 256 KiB; capture stops when full                                                                               |
| Optional raw successful results      | At most 20 artifacts, 4 MiB per file, 16 MiB total; original output retained when capture cannot proceed                                            |

Limits apply to package-generated matching filenames and new capture. Existing files are not deleted to enforce quotas. Concurrent writes are serialized with a local capture lock; lock contention skips capture. A crashed process can leave `.context-audit/.capture-lock`; after confirming no hook is running, remove that empty lock directory locally to resume. A full store may make telemetry incomplete; do not interpret missing records as proof of no activity.

The optional `results` package saves full successful Bash output, which may contain secrets; choosing it authorizes local raw artifact storage. Failures and unsupported results remain unchanged. `continuity` can inject a validated checkpoint into normal model context when selected. Read project facts only within the task's approved data scope.

## Retention and limits

There is no automatic deletion or retention sweep. Review and remove generated reports, summaries, inventories and traces when no longer needed under your organization's policy. Keep rollback manifests until the installation is accepted; deleting them removes automatic rollback. Check task evidence/checkpoints before deleting project artifacts. This package never changes native Claude history retention.

Private POSIX modes are access controls, not encryption or guaranteed enterprise approval. Windows requires appropriate ACLs; the package does not administer them. Existing unrelated parent directories/settings retain their permissions. A new internal ignore file reduces accidental commits but does not untrack files already in Git or override a pre-existing custom ignore policy. Backups, endpoint agents, administrators and other processes under the same user may access local files. This helper does not sandbox malicious same-user processes or attest all machine egress.

## Native telemetry is a separate decision

Existing native/managed Claude telemetry can remain active. Absence of `OTEL_*` in a helper's environment does not prove it is disabled: Claude strips those variables from subprocesses. For future native collection, use your organization's approved configuration and minimize captured attributes. Do not enable raw prompts, tool content or request/response bodies just to obtain token metrics.

Sources checked 2026-11-13: [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage), [OpenTelemetry sensitive-data guidance](https://opentelemetry.io/docs/security/handling-sensitive-data/). These describe native behavior and data-minimization guidance; package protections above are implemented and tested in the bundled helpers, not certified by those projects.
