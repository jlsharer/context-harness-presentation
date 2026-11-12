Delegate a bounded task with explicit files/anchors, acceptance and ownership. Return exactly task_id, summary, source_anchors, findings, checks [{command,status}], open_questions. Unknown fields (including nested check fields) are rejected. The complete serialized JSON must be at most 12000 UTF-8 bytes; this is a byte bound, not a native token estimate. Keep full supporting artifacts outside the report and reference them through source anchors.

Run `node .context-kit/run.mjs handoff report.json` before parent delivery. Status is passed, failed or not-run; verify evidence for claimed checks. Structural validation is not factual verification.

The Claude automatic gate requires v2.1.271+ auto mode and an actual SubagentHandback delivery path. It validates tool_input.message in PreToolUse and denies invalid reports. Outside that path, the SubagentStart reminder and manual validator remain available; the installer does not change permission mode or enable auto mode. SubagentStop closing text may differ from the report and feedback goes to the child; use PostToolUse Agent for supported parent-context additions. Other orchestrators must call the validator before delivery. Parent peak and aggregate input are separate metrics.

Source: https://code.claude.com/docs/en/hooks
