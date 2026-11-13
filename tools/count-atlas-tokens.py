"""Rebuild: node tools/export-atlas-texts.cjs | python3 tools/count-atlas-tokens.py
Requires tiktoken==0.12.0; only the build needs Python/vocabulary access.
The delivered browser bundle has no tokenizer/network dependency.
"""

import subprocess
import sys
import json
import hashlib
import pathlib
import importlib.metadata
import tiktoken

assert importlib.metadata.version("tiktoken") == "0.12.0"
enc = tiktoken.get_encoding("o200k_base")
count = lambda text: len(enc.encode(text, disallowed_special=()))
source = json.load(sys.stdin)


def convert(item):
    previous = 0
    layers = []
    for layer in item["layers"]:
        total = count(layer["prefix"])
        layers.append(
            {
                "id": layer["id"],
                "label": layer["label"],
                "tokens": total - previous,
                "prefixTokens": total,
            }
        )
        previous = total
    result = {
        "tokens": count(item["text"]),
        "bytes": len(item["text"].encode()),
        "sha256": hashlib.sha256(item["text"].encode()).hexdigest(),
        "layers": layers,
    }
    assert previous == result["tokens"]
    if "output" in item:
        result["outputTokens"] = count(item["output"])
    return result


result = {
    "encoding": "o200k_base",
    "tokenizerVersion": "0.12.0",
    "nativeUsage": False,
    "scope": "Exact shown teaching text only; excludes provider roles, tools, hidden instructions and generated output. Prefix differences allocate headings/separators in load order. Not native usage for any named model.",
}
for kind, items in source.items():
    result[kind] = {key: convert(item) for key, item in items.items()}
result["scale"] = max(r["tokens"] for r in result["requests"].values())
root = pathlib.Path(__file__).resolve().parents[1] / "docs"
(root / "research/round06/token-counts.json").write_text(json.dumps(result, indent=2) + "\n")
generated_code = (
    "'use strict';\nconst atlasTokens=" + json.dumps(result, separators=(",", ":")) + ";\n"
)
formatted_code = subprocess.check_output(
    [
        "node",
        str(root.parent / "tools" / "format-source.mjs"),
        "--stdin",
        "--filepath",
        str(root / "atlas-tokens.js"),
    ],
    input=generated_code,
    text=True,
)
(root / "atlas-tokens.js").write_text(formatted_code)
print(
    "Reference token manifest rebuilt: 28 replay states, 2 S1 inputs, 6 candidates", file=sys.stderr
)
