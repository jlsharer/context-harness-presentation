import json
import pathlib
import shutil
import subprocess
import tempfile
import zipfile

root = pathlib.Path(__file__).resolve().parents[1]
archives = root / "docs/kits/claude"
assert (root / "docs/kits/claude-native.zip").is_file(), "Native source archive required"
assert len(list(archives.glob("*.zip"))) == 26, "One native download per bundle and standalone item"
with tempfile.TemporaryDirectory(prefix="native-download-") as temporary:
    temporary = pathlib.Path(temporary)
    home = temporary / ".claude"
    for name, expected in [
        ("technique-goal-reminder", "hooks/goal-reminder.mjs"),
        ("technique-qa-triage-skill", "skills/qa-failure-triage/SKILL.md"),
    ]:
        source = temporary / name
        with zipfile.ZipFile(archives / (name + ".zip")) as z:
            z.extractall(source)
            assert not any(
                "context-kit" in p or "PROTOCOLS" in p or "context-menu" in p for p in z.namelist()
            )
        command = ["node", str(source / "install.mjs"), "--claude-home", str(home)]
        preview = subprocess.run(command, capture_output=True, text=True, check=True)
        assert expected in json.loads(preview.stdout)["files"]
        if name.endswith("goal-reminder"):
            assert not home.exists(), "Preview must not create ~/.claude"
        subprocess.run(command + ["--apply"], capture_output=True, text=True, check=True)
        subprocess.run(command + ["--apply"], capture_output=True, text=True, check=True)
        shutil.rmtree(source)
        assert (home / expected).is_file()
    result = subprocess.run(
        ["node", str(home / "hooks/goal-reminder.mjs")],
        input='{"hook_event_name":"UserPromptSubmit"}',
        capture_output=True,
        text=True,
        check=True,
    )
    assert "additionalContext" in json.loads(result.stdout)["hookSpecificOutput"]
    assert (home / "hooks/goal-reminder.mjs").is_file(), "Separate archive install is additive"
    assert not (home / "skills/context-menu").exists()
    assert not (home / ".context-kit").exists()
    for archive in archives.glob("*.zip"):
        folder = temporary / "verify"
        with zipfile.ZipFile(archive) as z:
            z.extractall(folder)
        subprocess.run(
            ["node", str(folder / "install.mjs"), "--claude-home", str(temporary / "preview")],
            check=True,
            capture_output=True,
            text=True,
        )
        shutil.rmtree(folder)
print(
    "PASS 26 focused native archives, separate additive installs, deleted-installer independence and preview-only defaults"
)
