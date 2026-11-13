"""Rebuild the browser catalog and portable offline toolkit ZIP. Requires the pinned development formatter; delivered helpers remain dependency-free."""

import pathlib
import json
import zipfile
import subprocess

root = pathlib.Path(__file__).resolve().parents[1] / "docs"
catalog = json.loads((root / "kits/catalog.json").read_text())
techniques = json.loads((root / "kits/techniques.json").read_text())
(root / "kits/local-data.mjs").write_bytes(
    (root / "audit/context-audit/scripts/local-data.mjs").read_bytes()
)
generated_code = (
    "'use strict';\nconst atlasKits08="
    + json.dumps(catalog)
    + ";\nconst atlasTechniques14="
    + json.dumps(techniques)
    + ";\n"
)
formatted_code = subprocess.check_output(
    [
        "node",
        str(root.parent / "tools" / "format-source.mjs"),
        "--stdin",
        "--filepath",
        str(root / "atlas-kits08.js"),
    ],
    input=generated_code,
    text=True,
)
(root / "atlas-kits08.js").write_text(formatted_code)
with zipfile.ZipFile(root / "kits/context-kits.zip", "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted((root / "kits").rglob("*")):
        if f.is_file() and f.suffix != ".zip":
            z.write(f, str(f.relative_to(root / "kits")))
print("Built context-kits.zip and matching browser catalog")
