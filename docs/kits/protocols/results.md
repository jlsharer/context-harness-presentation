Use `node .context-kit/run.mjs bound result.txt 8000 .context-kit/artifacts` to save a complete text artifact and return a preview. Bounds are characters, not tokens. Retrieve the artifact when omitted facts matter.

The Claude package also installs a Bash PostToolUse adapter using current `updatedToolOutput`. It retains the original structured response in `.context-kit/artifacts/<sha256>.json` and replaces only stdout with a preview plus retrieval path (at most 8000 characters total). Metadata and the native result shape are preserved. Stderr, interrupted/image/error results and unknown shapes pass through unchanged; other tools use the portable wrapper. Artifact conflicts stop rewriting rather than overwriting existing data.

This changes the model-visible result after execution. Tool side effects and original telemetry remain. Test against the installed Claude version supporting this output field; source-matched/offline fixtures do not verify native runtime execution. Compare returned input and task acceptance before choosing a bound.

Source: https://code.claude.com/docs/en/hooks#posttooluse-decision-control
