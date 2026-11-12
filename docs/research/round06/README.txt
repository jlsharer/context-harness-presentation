Reference tokens: tiktoken 0.12.0 / o200k_base. Offline, deterministic, no model calls.
Reproduce from repository root:
  python3 -m pip install --target /tmp/context-tokenizer tiktoken==0.12.0
  node tools/export-atlas-texts.cjs | PYTHONPATH=/tmp/context-tokenizer python3 tools/count-atlas-tokens.py
  node tests/atlas-tokens.cjs
Counts cover the exact serialized teaching text; they are not native provider usage.
Layer allocations = cumulative-prefix token counts minus preceding prefix count.
This includes headings and separators and sums exactly to each whole text count.
Stack scale = largest replay snapshot, not a model capacity or usage limit.
S1 is a separate summary request. Its input is not added to the parent window.
