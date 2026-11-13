import pathlib
import zipfile
import json
import subprocess
import tempfile

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
    with tempfile.TemporaryDirectory(prefix="claude-download-") as temporary:
        kit = pathlib.Path(temporary) / "download"
        project = pathlib.Path(temporary) / "project"
        kit.mkdir()
        project.mkdir()
        archive.extractall(kit)
        command = [
            "node",
            str(kit / "install.mjs"),
            "--harness",
            "claude",
            "--kits",
            "focus,results,continuity,handoff,cache,qa",
            "--target",
            str(project),
            "--apply",
        ]
        subprocess.run(command, check=True, capture_output=True, text=True)
        assert (project / "CLAUDE.md").is_file()
        for skill in [
            "context-workflow",
            "qa-regression-repair",
            "qa-release-validation",
            "qa-failure-triage",
            "qa-fixture-review",
            "qa-regression-design",
            "qa-evidence-report",
        ]:
            directory = project / ".claude/skills" / skill
            assert (directory / "SKILL.md").is_file(), skill
            assert (directory / "scripts/qa.mjs").is_file(), skill
            assert (directory / "references/repository-setup.md").is_file(), skill
        settings = json.loads((project / ".claude/settings.json").read_text())
        for event in [
            "UserPromptSubmit",
            "PreCompact",
            "SessionStart",
            "PostToolUse",
            "SubagentStart",
        ]:
            assert settings["hooks"][event], event
        assert (project / ".claude/agents/context-ci-evidence.md").is_file()
        assert not (project / ".opencode").exists()
        subprocess.run(command, check=True, capture_output=True, text=True)
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
print(
    "PASS ZIP/source fidelity, extracted Claude install/reapply with skills/hooks/agents/guidance, and browser catalog"
)
