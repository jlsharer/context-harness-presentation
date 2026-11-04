// Native HTML diagrams keep the revised content selectable and responsive.
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
calls: `
<div class="eyebrow">ONE USER REQUEST · HYPOTHETICAL TOKEN-PRICED API RUN</div>
<h1>One request can become a whole team’s calls</h1>
<p class="intro">A model call is one provider inference request and its response. A delegated worker can make several.</p>
<div class="run">
<div class="parent-lane">
<div class="call">
<b>Parent A · delegate</b>
<span>20K in / 2K out</span>
<strong>$0.06</strong>
</div>
<div class="bridge">↓ scoped task<br>
<small>Child gets its own 50K input</small>
</div>
<div class="bridge">↑ 2K summary + 1K evidence<br>
<small>Parent retains its own history</small>
</div>
<div class="call">
<b>Parent E · answer</b>
<span>25K in / 2K out</span>
<strong>$0.07</strong>
</div>
</div>
<div class="worker-lane">
<div class="lane-label">ONE CHILD SESSION <span>3 calls + 2 tool actions</span>
</div>
<div class="child-calls">
<div class="call">
<b>B · request files</b>
<div class="tokenbar" style="--fill:58.82%">50K input</div>
<span>49K base + 1K task</span>
<strong>2K out · $0.12</strong>
</div>
<div class="tool-step">→<b>Read files</b>
<span>13K result</span>
</div>
<div class="call">
<b>C · request tests</b>
<div class="tokenbar" style="--fill:76.47%">65K input</div>
<span>50 + 2 + 13 = 65K</span>
<strong>2K out · $0.15</strong>
</div>
<div class="tool-step">→<b>Run tests</b>
<span>18K result</span>
</div>
<div class="call">
<b>D · summarize</b>
<div class="tokenbar" style="--fill:100%">85K input</div>
<span>65 + 2 + 18 = 85K</span>
<strong>2K out · $0.19</strong>
</div>
</div>
</div>
</div>
<div class="metrics">
<div>
<strong>85K</strong>
<span>peak input to one call</span>
</div>
<div>
<strong>245K + 10K</strong>
<span>all five calls’ input + output</span>
</div>
<div>
<strong>$0.59</strong>
<span>$0.46 child + $0.13 parent</span>
</div>
</div>
<p class="fine">Hypothetical $2/M input + $10/M output, no cache or tool fees. Retained outputs become later inputs. A user turn can trigger many billable calls. Subscription quotas follow product rules.</p>`,
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
scope: `
<div class="eyebrow">A WORKSPACE IS LARGER THAN A MODEL’S CURRENT VIEW</div>
<h1>From the workspace to one model’s view</h1>
<div class="context-world">
<div class="world-caption">AVAILABLE CANDIDATES <span>Stored artifacts + current instructions and request</span>
</div>
<div class="world-flow">
<div class="shelves">
<h2>The workspace</h2>
<div>Repository <small>source files · tests · contracts</small>
</div>
<div>Memory store <small>preferences · decisions · facts</small>
</div>
<div>Session archive <small>messages · logs · trace artifacts</small>
</div>
<div>Current setup <small>system rules · skills · user goal</small>
</div>
<p>Full artifacts stay available for later retrieval.</p>
</div>
<div class="selection">
<div class="route-arrow">→ SELECT & TRANSFORM →</div>
<h2>The harness</h2>
<div>
<b>Retrieve</b>
<small>relevant contract clause</small>
</div>
<div>
<b>Filter</b>
<small>failed assertion + log reference</small>
</div>
<div>
<b>Compact</b>
<small>decisions + unfinished work</small>
</div>
<div>
<b>Assemble</b>
<small>rules + goal + selected evidence</small>
</div>
</div>
<div class="packet">
<div class="packet-heading">ONE CALL<br>
<small>Input + reserved generation budget</small>
</div>
<div class="packet-input">
<b>ACTIVE CONTEXT</b>
<div class="packet-part">Required instructions</div>
<div class="packet-part">Loaded skill + memory</div>
<div class="packet-part">Goal + compacted history</div>
<div class="packet-part selected">Contract clause + failing test</div>
</div>
<div class="headroom">Reserved output headroom</div>
<div class="model-target">↓ MODEL CALL ↓<br>
<small>Use selected evidence to propose a fix</small>
</div>
</div>
</div>
</div>
<p class="takeaway">The next call gets a fresh selection. A child gets its own packet. Selected content may be transformed or summarized.</p>`,
economics: `
<div class="eyebrow">PER-CALL USAGE → COST PER VALIDATED TASK</div>
<h1>Price the tokens each call actually uses</h1>
<div class="formula">C = Σ<sub>i</sub> (U<sub>i</sub>P<sub>u,i</sub> + R<sub>i</sub>P<sub>r,i</sub> + W<sub>i</sub>P<sub>w,i</sub> + O<sub>i</sub>P<sub>o,i</sub>) / 1,000,000 + F</div>
<p class="formula-key">C = API dollars &nbsp;·&nbsp; i = model call &nbsp;·&nbsp; P = category rate in USD per million &nbsp;·&nbsp; F = other fees</p>
<div class="cost-body">
<div class="terms">
<div>
<b>U · Uncached input</b>
<span>Input processed at the normal input rate, excluding separately billed writes.</span>
</div>
<div>
<b>R · Cache-read input</b>
<span>An eligible repeated prefix reused from the provider’s cache.</span>
</div>
<div>
<b>W · Cache-write input</b>
<span>Input stored for reuse and billed at a write rate, where applicable.</span>
</div>
<div>
<b>O · Output</b>
<span>Generated tokens, including reasoning when counted there by the provider.</span>
</div>
<div>
<b>F · Other fees</b>
<span>Billable tools, storage and additional services.</span>
</div>
</div>
<aside class="cost-example">
<span class="eyebrow">SLIDE 3 · HYPOTHETICAL</span>
<h2>Five calls → one result</h2>
<p>245K input × $2/M <b>$0.49</b>
</p>
<p>10K output × $10/M <b>$0.10</b>
</p>
<hr>
<strong>$0.59</strong>
<span>for one accepted task</span>
<small>No cache or other fees assumed.</small>
</aside>
</div>
<p class="fine">Log call / agent / model / usage / duration / validation. Include failed attempts and retries in total spend. Measure time to validation and subscription quota separately.</p>`
};
