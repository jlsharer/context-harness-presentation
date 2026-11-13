# Diagnose before choosing the repair layer

## Evidence packet

Capture the first causal failure, expected invariant, actual observation, revision, execution environment, source anchors and a bounded reproduction. Preserve downstream errors separately so they do not replace the original cause. Exclude credentials. Record which details were observed and which are hypotheses.

Use this decision table; uncertainty is an allowed outcome.

| Candidate           | Supporting evidence                                                  | Discriminating check                                           | Repair boundary                                             |
| ------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| Product defect      | Supported product contract fails with valid isolated inputs          | Minimal product-level or integration counterexample            | Relevant product code plus regression, within authorization |
| Test/fixture defect | Assertions/setup/ownership violate the intended test contract        | Correct the setup in an isolated diagnostic and compare        | Test, fixture or test configuration                         |
| Environment issue   | Missing dependency, resource or configuration explains the failure   | Compare environment facts with the supported execution profile | Approved environment/configuration work                     |
| Unresolved          | Evidence conflicts, logs are missing, or repro is not discriminating | Collect the smallest next fact that separates hypotheses       | Further investigation; no speculative patch                 |

## Reproduction loop

1. Run the smallest authorized check against the reported revision or clearly identify the mismatch.
2. Change one relevant condition: parallelism, seed, resource ownership, environment or input. Preserve the command/configuration used for each comparison.
3. Inspect both the test fixture and owning product path. A passing isolated run suggests interference but does not establish which layer is defective.
4. Write a short hypothesis with supporting anchors, counterevidence and the next falsifying check.
5. Stop repeated trials at the task's agreed budget. Report failure frequency as an observed count, not a calibrated confidence or a universal guarantee.

For the presentation's shared-cart example, useful evidence is that one spec's cleanup targets another spec's cart ID, while the product correctly acts on the ID supplied. Merely increasing timeouts or observing one passing retry does not establish that cause.

## Delegation packet

Give a read-only worker the exact question, permitted files/log artifact, source range, expected output fields and budget. Ask it to report uncertainty and counterevidence. The coordinator reconciles the report with primary sources; schema validity does not make the diagnosis correct. Escalate conflicting results or scope overflow rather than dispatching increasingly broad copies of the same parent history.

## Exit gate

Produce a supported classification, a falsifiable regression proposal and an authorized edit scope. If those are missing, hand off the next discriminating check and keep diagnosis unresolved. Store the complete evidence report locally; the bounded worker report points to it rather than embedding full logs.
