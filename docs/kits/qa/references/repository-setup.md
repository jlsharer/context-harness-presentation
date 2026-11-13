# Bind the workflow to this repository

Read this before executing a QA workflow in an unfamiliar repository. The package does not invent test commands, provision credentials or authorize remote actions.

## Establish the working boundary

1. Locate the repository root and current worktree. Read applicable native guidance before choosing commands or edit paths. Inspect `git status --short` and `git rev-parse HEAD`; preserve unrelated changes.
2. Read the relevant package/build manifest and test-runner configuration, not every repository file. Find the existing targeted test, fixtures and reporting conventions with bounded searches.
3. Identify the project's package manager and supported runtime from its lockfile/configuration. Use existing scripts and local tools. Do not silently install a global runner or substitute another framework.
4. Record the requested goal, allowed edit paths, acceptance constraints and required local/remote checks in a task packet. Resolve missing acceptance requirements before treating a result as complete.

Start from the installed `assets/task.json`. Replace its draft task/revision markers and configure actual commands. Run:

```sh
node .context-kit/qa.mjs validate-task task.json
```

Examples assume the repository root. From a subdirectory, use a quoted absolute helper path after determining the root. A workflow's input/output contracts remain the same across native harnesses; tool capabilities and permissions do not.

## Local execution profile

For Playwright, read the project's config and scripts first. The CLI supports targeted files, `--workers`, `--repeat-each` and reporters; the repository's own script may add required setup. Compare a bounded isolated run and parallel run only when that comparison addresses the hypothesis. Set an explicit repetition/time budget. Do not repeatedly run a failing suite without learning a new fact.

Record command, exit status, report path and the tested code identity. If tests ran on an uncommitted patch, record that fact and a patch/tree fingerprint. Before attributing those results to a later commit, establish that the committed tested files match, or rerun the relevant checks. Do not relabel a result with a new SHA merely because it is convenient.

## CI profile

Use the organization's installed, approved CI client. For GitHub Actions, read-only examples are:

```sh
gh pr checks PR_NUMBER --json name,state,link
gh run view RUN_ID --json status,conclusion,headSha,url,jobs
```

Inspect the run's `headSha`, required job conclusions and actual test report. Fetch a bounded relevant log excerpt when necessary; keep the full report in the approved evidence location. If a CLI field is unsupported, inspect the installed command's help/schema instead of guessing. Treat missing credentials, inaccessible logs and unsupported CI providers as explicit evidence gaps. Do not copy authentication output or secrets into the task report.

A request to investigate CI does not inherently authorize pushing, rerunning paid jobs, changing branch protection or deploying. Reuse existing authorization when it covers the concrete action. Otherwise prepare the diff/evidence before requesting the missing authorization. The task packet's action metadata records intent; it never grants native permissions.

## Native entry points

- Claude: invoke `/context-workflow`, `/qa-regression-repair` or `/qa-release-validation` when installed.
- Codex: invoke the corresponding `$context-workflow`, `$qa-regression-repair` or `$qa-release-validation` skill.
- OpenCode: use the delivered command wrapper where installed, or ask the agent to use the named skill.
- Portable: explicitly read the selected `.context-kit/skills/NAME/SKILL.md` and invoke helpers through Node.

Sources: [Playwright CLI](https://playwright.dev/docs/test-cli), [GitHub run inspection](https://cli.github.com/manual/gh_run_view), [Claude skills](https://code.claude.com/docs/en/skills), [Codex skills](https://learn.chatgpt.com/docs/build-skills).
