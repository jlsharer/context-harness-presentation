# Review resource ownership in parallel tests

Read the real test-runner configuration and repository fixture helpers. Do not assume that a fixture's name establishes its scope. In Playwright, distinguish test-scoped and worker-scoped fixtures and inspect setup/teardown dependencies; other frameworks use different lifetime rules.

## Ownership ledger

For each contested resource, record:

| Field            | Question                                                          |
| ---------------- | ----------------------------------------------------------------- |
| Identity         | Which user, cart, tenant, session, file or database key is used?  |
| Creator          | Which test/helper creates it, and with which unique namespace?    |
| Lifetime         | Is it per operation, test, worker, suite or external environment? |
| Mutators         | Can another test or worker modify the same identity?              |
| Cleanup          | Can teardown delete or reset state it does not own?               |
| Product contract | Does the product guarantee isolation for the supplied identity?   |

Trace the identity from setup through the product request and cleanup. Static variables, shared credentials, singleton sessions and broad cleanup queries are candidate signals, not automatic proof of a defect.

## Discriminating checks

- Compare isolated and concurrent runs on the same revision and environment.
- Make the suspected competing operation deterministic with a controlled barrier or explicit state setup where the framework permits it.
- Verify that unique test-owned resources remove the interference without weakening the intended product assertion.
- Check failure-path cleanup as well as success. Use the repository's existing lifecycle facilities; derive API/helper names from actual source.

Prefer a per-test ownership fix when the test contract requires independent mutable state. Worker-scoped immutable setup can be useful when mutation and cleanup boundaries are explicit. Do not isolate away a real product cross-tenant/data-leak defect: preserve a product-level regression if valid inputs violate that contract.

## Repair packet

Return the ownership ledger, conflicting source anchors, proposed fixture change, deterministic regression and limitations. Identify any existing test-data factory/setup conventions to reuse. Do not create speculative endpoint names or replace a framework merely to fit this protocol.

Verify targeted behavior, repeated parallel execution and relevant neighboring tests with a bounded budget. Record the tested revision/patch identity, actual reports and remaining environment differences. A successful sample does not prove the absence of all flakes.

Source: [Playwright fixtures and scope](https://playwright.dev/docs/test-fixtures). The ownership procedure above is an authored cross-framework review protocol; native configuration must be inspected in the target repository.
