# Authoring basis and implementation scope

These are original, reusable operating packages. Their structure follows public guidance and practical patterns: narrow discovery metadata, progressive references, concrete stage inputs/outputs, scripts for deterministic checks, explicit tool prerequisites, evidence-linked outputs and scenario evaluation. They are not copied vendor skills or certified by a provider.

Primary references checked 2026-11-13:

- [Anthropic skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): progressive disclosure, workflow decisions, executable helpers and evaluations.
- [Anthropic webapp-testing skill](https://github.com/anthropics/skills/tree/main/skills/webapp-testing): concrete prerequisites, discovery before action and callable helper resources.
- [OpenAI GitHub Fix CI skill](https://github.com/openai/skills/tree/main/skills/.curated/gh-fix-ci): bounded CI inspection, authentication/tool assumptions, failure summaries and rechecking results.
- [OpenAI skill documentation](https://learn.chatgpt.com/docs/build-skills): metadata, supporting resources and native skill discovery/invocation.
- [Claude Code skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks) and [subagents](https://code.claude.com/docs/en/sub-agents): native integration boundaries.
- [OpenCode commands](https://opencode.ai/docs/commands/): command wrappers submit prompts; they are not permission grants or deterministic workflow engines.
- [Playwright fixtures](https://playwright.dev/docs/test-fixtures), [CLI](https://playwright.dev/docs/test-cli) and [GitHub run inspection](https://cli.github.com/manual/gh_run_view): repository-specific tooling examples.

The package uses the user's existing authorization rather than importing another project's approval conventions wholesale. Native model availability, installed event behavior, repository commands and real accepted-task quality require environment validation. Helper checks validate declared structure and coverage, not the truth of an artifact or permission to perform an external action.
