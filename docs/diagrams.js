// Native diagrams share one worked example and token ledger.
const diagrams = {
intro: `
<div class="eyebrow">CONTEXT & HARNESS ENGINEERING</div>
<h1>Engineer the work around the prompt.</h1>
<p class="lead">Prompt engineering shapes the instruction.<br>Context engineering supplies the evidence. Harness engineering runs the process.</p>
<div class="three pillars">
<section>
<span class="step">01</span>
<h2>Prompt</h2>
<p>What should the model do?</p>
<ul>
<li>Goal and constraints</li>
<li>Examples and response format</li>
</ul>
</section>
<section>
<span class="step">02</span>
<h2>Context</h2>
<p>What can it use now?</p>
<ul>
<li>Instructions, skills and memory</li>
<li>Relevant files and tool results</li>
</ul>
</section>
<section>
<span class="step">03</span>
<h2>Harness</h2>
<p>How does the work finish?</p>
<ul>
<li>Model routing and tool execution</li>
<li>Delegation, budgets and validation</li>
</ul>
</section>
</div>
<p class="takeaway">Evaluate the complete task through quality, cost and time to a validated result.</p>`,
assembly: `
<div class="eyebrow">ASSEMBLY · EACH PARENT OR CHILD CALL</div>
<h1>How the harness assembles a model request</h1>
<p class="intro">A common packaging pattern. Role fields, tool placement and loading order vary by provider and harness.</p>
<div class="assembly">
<div class="assembly-axis">
<span>Stable setup</span>
<div>↓</div>
<span>Selected state</span>
<div>↓</div>
<span>Recent exchange</span>
</div>
<div class="assembly-stack">
<div class="assembly-row system">
<b>1 · System instructions</b>
<span>Policy + model-specific guidance</span>
<small>Provider / platform / developer</small>
</div>
<div class="assembly-row harness">
<b>2 · Harness setup</b>
<span>Agent role + tool schemas + permissions</span>
<small>Harness configuration</small>
</div>
<div class="assembly-row skills">
<b>3 · Skills</b>
<span>Loaded procedures + references</span>
<small>Installed skill files</small>
</div>
<div class="assembly-row memory">
<b>4 · Memory + traces</b>
<span>Preferences + decisions + summaries</span>
<small>Memory store / trace artifacts</small>
</div>
<div class="assembly-row task">
<b>5 · Task + conversation</b>
<span>Goal + user messages + retained replies</span>
<small>User / workflow state</small>
</div>
<div class="assembly-row evidence">
<b>6 · Evidence + tool results</b>
<span>Selected files + search + test output</span>
<small>Repository / search / tools</small>
</div>
</div>
<aside class="assembly-dest">
<span class="step">→</span>
<h2>One request</h2>
<p>Instructions + tool definitions + selected messages</p>
<hr>
<p>Preserve tool-call / result pairing in message order.</p>
<small>Model weights shape behavior separately from the input.</small>
</aside>
</div>
<p class="fine">Skills and memory can load on demand. Evidence can be embedded within messages. Output headroom is reserved separately.</p>`,
};

diagrams.loop = `
<div class="eyebrow">FROM ONE REQUEST TO AN ACCEPTED RESULT</div>
<h1>The harness runs a loop around each model call</h1>
<p class="intro">Prompt engineering shapes instructions and requests. Context engineering selects, orders and updates what the model can use.</p>
<div class="loop-grid">
${[
 ['1 · Receive', 'Understand the request', 'Specify the goal, constraints and acceptance test.', 'Capture user input and current task state.'],
 ['2 · Assemble', 'Prepare the next input', 'Load role instructions and the response format.', 'Select skills, memory, files and recent history.'],
 ['3 · Infer', 'Send one model request', 'The model interprets the supplied instructions.', 'The model uses the assembled input and emits output.'],
 ['4 · Act', 'Execute requested tools', 'Tool descriptions guide argument generation.', 'CLI or MCP results become candidate evidence.'],
 ['5 · Update', 'Prepare retained state', 'Restate an unresolved requirement if needed.', 'Filter logs, save artifacts and compact old history.'],
 ['6 · Check / repeat', 'Accept or return to assembly', 'Compare the result to the acceptance criteria.', 'Load missing evidence for the next call.']
].map(row => `<section><span class="eyebrow">${row[0]}</span><h2>${row[1]}</h2><p><b class="prompt-tag">Prompt</b> ${row[2]}</p><p><b class="context-tag">Context</b> ${row[3]}</p></section>`).join('')}
</div>
<p class="takeaway">↺ Return to Assemble until validation passes or a budget / permission boundary stops the run.</p>`;

diagrams.calls = `
<div class="eyebrow">ONE USER REQUEST · ONE SESSION · HYPOTHETICAL ACCUMULATION</div>
<h1>Six model calls can follow one prompt</h1>
<div class="example-prompt">“${example.prompt}”</div>
<div class="call-table-head"><span>Model call · 2K output each</span><span>Input against a 1M window</span><span>Tool action before the next call</span></div>
<div class="call-rows">
${example.calls.map((call, i) => `<div class="call-row"><div><b>${i + 1} · ${call.label}</b><small>${i === 0 ? '40K setup + 10K task' : example.calls[i-1].inputK + 'K prior + 2K output + ' + example.calls[i-1].toolK + 'K tool result'}</small></div><div><div class="capacity-track" role="img" aria-label="${call.inputK} thousand of one million input tokens, ${call.inputK/10} percent"><span style="width:${call.inputK/10}%"></span></div><small>${call.inputK}K input · ${call.inputK/10}% of 1M</small></div><div><b>${call.tool}</b><small>${call.toolK ? '+' + call.toolK + 'K retained tool results →' : 'User receives the answer'}</small></div></div>`).join('')}
</div>
<div class="metrics"><div><strong>850K</strong><span>largest input · 85% of window</span></div><div><strong>2,550K + 12K</strong><span>six calls’ input sum + output</span></div><div><strong>6 invocations</strong><span>one provider request + response per call</span></div></div>
<p class="fine">1M is illustrative; windows vary. Output uses remaining space. Full retention and large tool batches expose growth. User turns may trigger more calls; API spend follows usage, not turn count. Subscription quotas are separate.</p>`;

diagrams.performance = `
<div class="eyebrow">SAME SIX CALLS · CAPACITY AND EVIDENCE USE</div>
<h1>As context grows, test whether the key fact survives</h1>
<p class="intro">The API rule arrives in the first tool batch. Later code and logs surround it as input grows from 150K to 850K.</p>
<div class="performance-body">
<section class="position-map"><h2>Where is the rule?</h2><p>“The same idempotency key must return the existing order.”</p>
${[1,3,5].map(i => `<div class="evidence-line"><b>Call ${i+1} · ${example.calls[i].inputK}K</b><div class="evidence-track"><span class="accrued" style="width:${example.calls[i].inputK/10}%"></span><span class="fact-marker" style="left:8%"></span></div><small>Fixed 1M scale · rule at illustrative token 80K</small></div>`).join('')}
<p class="fine">Gold marker = relevant evidence. Teal = occupied input. Position is hypothetical.</p></section>
<section class="performance-checks"><h2>What changes?</h2><div><b>More competing material</b><p>Extra logs may distract from the API rule. Older evidence shifts in relative position.</p></div><div><b>Potentially more processing time</b><p>Longer uncached input can add latency. Model, cache hits and load affect the result.</p></div><div><b>Measure evidence-use success</b><p>Across repeated runs, count correct duplicate-order behavior at 150K, 500K and 850K. Also test early, middle and late placement.</p></div></section>
</div>
<p class="takeaway">Capacity measures what fits. Retrieval tests measure whether relevant evidence is found and used. Attention is an internal mechanism.</p>
<p class="fine">Liu et al. found position effects in tested models and tasks. These diagrams show context occupancy, with no predicted accuracy curve. Source in notes.</p>`;

diagrams.economics = `
<div class="eyebrow">SAME SIX CALLS · ILLUSTRATIVE TRAFFIC AT PUBLISHED SONNET 5.5 RATES</div>
<h1>Cache billing changes the price of repeated input</h1>
<p class="intro">Cache the identical 40K setup once. Five later calls read it within the refreshed five-minute lifetime.</p>
<div class="billing-terms"><span><b>U</b> uncached · $2/M<small>Input processed at the ordinary rate</small></span><span><b>W</b> cache write · $2.50/M<small>Input stored for reuse</small></span><span><b>R</b> cache read · $0.10/M<small>Input reused from a cache hit</small></span><span><b>O</b> output · $10/M<small>Tokens generated by the model</small></span></div>
<table class="ledger"><thead><tr><th>Call</th><th>Input K</th><th>U K</th><th>W K</th><th>R K</th><th>O K</th><th>Cost</th></tr></thead><tbody>
${cacheLedger.map((row,i) => `<tr><th>${i+1}</th><td>${row.inputK}</td><td>${row.uncachedK}</td><td>${row.writeK}</td><td>${row.readK}</td><td>${row.outputK}</td><td>${money(row.cost,3)}</td></tr>`).join('')}
<tr class="total"><th>Σ</th><td>${singleInputK}</td><td>${sum(cacheLedger.map(r=>r.uncachedK))}</td><td>40</td><td>200</td><td>${singleOutputK}</td><td>${money(sum(cacheLedger.map(r=>r.cost)))}</td></tr></tbody></table>
<div class="billing-summary"><div><b>With caching · $4.86</b><span>$4.62 uncached + $0.10 write + $0.02 reads + $0.12 output</span></div><div><b>Without caching · ${money(uncachedCost(singleInputK,singleOutputK))}</b><span>2.55M input × $2 + 0.012M output × $10</span></div></div>
<p class="fine">C = Σ(U × Pᵤ + W × P𝓌 + R × Pᵣ + O × Pₒ) / 1M + other fees. P = USD per million. Input = U + W + R. K = 1,000. Cached tokens occupy context. No other fees or failed calls assumed. Rates verified 4 Nov 2026.</p>`;

diagrams.workers = `
<div class="eyebrow">SAME ORDER FIX · SAME FIVE TOOL BATCHES · HYPOTHETICAL SEQUENTIAL WORKFLOW</div>
<h1>Each worker has its own sequence of model calls</h1>
<div class="baseline-strip"><b>Single session · slide 3</b><span>50 → 150 → 300 → 500 → 700 → 850K</span><strong>6 calls · 2,550K input · 12K output</strong></div>
<div class="coordinator"><b>Orchestrator</b><span>Call A 50K → dispatch stages → Call B 60K</span><strong>110K cumulative input · 4K output</strong></div>
<div class="delegate-label">↓ scoped inputs · Research → Implement → Validate · ↑ three reports + evidence</div>
<div class="worker-grid">
${example.sessions.slice(1).map(session=>`<section><h2>${session.name}</h2><p>${session.role}</p><div class="worker-call-chain">${session.inputsK.map((n,i)=>`<div><b>Call ${i+1}</b><span>${n}K in</span><small>2K out</small><div class="mini-track"><span style="width:${n/10}%"></span></div></div>`).join('')}</div><strong>${sum(session.inputsK)}K cumulative input</strong><small>${session.inputsK.length*example.outputK}K output · peak ${Math.max(...session.inputsK)}K</small></section>`).join('')}
</div>
<div class="billing-summary"><div><b>Orchestrated · ${workerCalls} calls · ${workerInputK}K in + ${workerOutputK}K out</b><span>Each 50K start includes 40K setup + 10K assigned work.</span></div><div><b>No-cache cost · ${money(uncachedCost(workerInputK,workerOutputK))} vs $5.22 single</b><span>Same prefix-cache policy · $3.144 vs $4.860 single.</span></div></div>
<p class="fine">Each labeled box is one model call. Mini bars use the same 1M scale. Handoffs pass small reports. Assumed contexts illustrate a possible saving; compare quality, retries and handoff latency on matched tasks.</p>`;

diagrams.scope = `
<div class="eyebrow">ORGANIZATION + PUBLIC SOURCES → SELECTED EVIDENCE → MODEL INPUT</div>
<h1>Bring the right evidence into the workspace</h1>
<div class="source-flow">
<section class="source-shelves"><h2>Available context</h2><div><b>Internal · organization</b><p>Private order-service code, API specification, incident traces and team decisions.</p><small>MCP resource or CLI file read</small></div><div><b>External · public sources</b><p>Official framework docs, HTTP reference and dependency release notes.</p><small>Web / MCP search or CLI fetch</small></div><div><b>Local state</b><p>Current prompt, skills, memory, patches and test logs.</p><small>Workspace files + session artifacts</small></div></section>
<section class="source-select"><h2>Harness selection</h2><div><b>Retrieve the API rule</b><p>“POST /orders with a repeated idempotency key returns the existing order.”</p><small>A clause in the team’s API specification.</small></div><div><b>Use tools to get evidence</b><p>MCP reads the internal spec. CLI searches the handler and runs integration tests.</p></div><div><b>Filter + attach provenance</b><p>Keep the rule, failing assertion, source version and artifact references.</p></div></section>
<section class="source-packet"><h2>One model call</h2><div>Required instructions + selected skill</div><div>Task + relevant memory</div><div class="highlight">Internal API clause + handler excerpt</div><div>Public dependency guidance</div><div>Failed test + log reference</div><p>→ Propose a fix that follows the API rule.</p><small>Selected content enters this call. Full artifacts stay available for later retrieval.</small></section>
</div><p class="fine">MCP is an access protocol; CLI commands offer another retrieval path. Either can reach internal or external sources with appropriate access. Publicly accessible material may still be copyrighted. Keep source provenance.</p>`;

diagrams.decision = `
<div class="eyebrow">COMPARE THE WHOLE TASK · QUALITATIVE TRADEOFFS</div>
<h1>Choose an approach against all five dimensions</h1>
<table class="decision-table"><thead><tr><th>Dimension</th><th>One session<br><small>One coupled bug</small></th><th>Sequential workers<br><small>Research → implement → validate</small></th><th>Parallel workers<br><small>Independent security + UX reviews</small></th></tr></thead><tbody>
<tr><th>Context</th><td>Shared history grows across calls.</td><td>Scoped histories; preserve evidence at each handoff.</td><td>Separate histories; shared setup is repeated.</td></tr>
<tr><th>Quality</th><td>Preserves coupled decisions; stale history can distract.</td><td>Specialist checks can help; handoffs can lose details.</td><td>Independent perspectives can help; reconcile conflicting findings.</td></tr>
<tr><th>Cost</th><td>Low setup; repeated input can dominate. Example $5.22.</td><td>More calls and setup; scoped inputs can save tokens. Example $3.52.</td><td>Sum all workers plus integration. Concurrency alone gives no token discount.</td></tr>
<tr><th>Latency</th><td>Serial calls; little coordination delay.</td><td>Serial stages plus dispatch and handoff time.</td><td>Overlap can shorten the critical path; wait for the slowest needed result.</td></tr>
<tr><th>Control</th><td>One session’s permissions and budget; simple trace.</td><td>Per-stage permissions, schemas and validation gates.</td><td>Per-worker limits plus concurrency and conflict controls.</td></tr>
</tbody></table>
<p class="takeaway">Route models within any approach. Judge cost and elapsed time per accepted task, including retries and integration.</p>
<p class="fine">Dollar examples refer to slides 3 and 7 at the same model rates without caching. These are hypothetical token ledgers. Quality and latency require measurement; the parallel review example is a different workload.</p>`;
