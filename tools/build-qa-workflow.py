"""Bundle the authored QA scenario; no real sessions or CI executions are used."""

import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "docs/research/round14/qa-workflow.json").read_text())
source = "'use strict';\nconst atlasQA14=" + json.dumps(data) + ";\n"
output = subprocess.check_output(
    [
        "node",
        str(root / "tools/format-source.mjs"),
        "--stdin",
        "--filepath",
        str(root / "docs/atlas-qa14.js"),
    ],
    input=source,
    text=True,
)
(root / "docs/atlas-qa14.js").write_text(output)
