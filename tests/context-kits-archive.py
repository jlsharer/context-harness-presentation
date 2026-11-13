import pathlib
import zipfile
import json
import subprocess

root = pathlib.Path(__file__).resolve().parents[1] / "docs"
with zipfile.ZipFile(root / "kits/context-kits.zip") as archive:
    files = {
        str(p.relative_to(root / "kits")): p
        for p in (root / "kits").rglob("*")
        if p.is_file() and p.suffix != ".zip"
    }
    assert set(archive.namelist()) == set(files), "ZIP file list must match the toolkit"
    for name, path in files.items():
        assert archive.read(name) == path.read_bytes(), name + " differs from tested source"
    assert "context-menu/SKILL.md" in files and "README.md" in files
bundle = subprocess.check_output(
    [
        "node",
        "-e",
        "const fs=require('fs'),vm=require('vm'); const c=vm.createContext({}); vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c); console.log(vm.runInContext('JSON.stringify(atlasKits08)',c));",
        str(root / "atlas-kits08.js"),
    ],
    text=True,
)
assert json.loads(bundle) == json.loads((root / "kits/catalog.json").read_text())
print("PASS downloadable ZIP/source fidelity, native reference skill/README and browser catalog")
