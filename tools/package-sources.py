"""Create deterministic source archives and safely extract trusted workshop archives."""

from pathlib import Path
import argparse
import zipfile
import os
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument("--source-dir")
parser.add_argument("--output")
parser.add_argument("--prefix", default="")
parser.add_argument("--files", nargs="*")
parser.add_argument("--extract")
parser.add_argument("--target")
args = parser.parse_args()
if args.extract:
    target = Path(args.target).resolve()
    with zipfile.ZipFile(args.extract) as archive:
        for entry in archive.infolist():
            dest = (target / entry.filename).resolve()
            if not dest.is_relative_to(target) or entry.external_attr >> 16 & 0o170000 == 0o120000:
                raise ValueError("Unsafe archive entry: " + entry.filename)
        archive.extractall(target)
else:
    source = Path(args.source_dir).resolve()
    files = [source / name for name in args.files] if args.files else sorted(source.rglob("*"))
    output = Path(args.output).resolve()
    temporary = tempfile.NamedTemporaryFile(dir=output.parent, suffix=".zip", delete=False)
    temporary.close()
    try:
        with zipfile.ZipFile(temporary.name, "w", zipfile.ZIP_DEFLATED) as archive:
            for file in files:
                if file.is_symlink():
                    raise ValueError("Refusing symlink: " + str(file))
                if (
                    not file.is_file()
                    or file.suffix in {".zip", ".pyc"}
                    or "__pycache__" in file.parts
                ):
                    continue
                name = args.prefix + file.relative_to(source).as_posix()
                info = zipfile.ZipInfo(name, (2026, 11, 12, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, file.read_bytes())
        with zipfile.ZipFile(temporary.name) as archive:
            if archive.testzip() is not None:
                raise ValueError("Archive integrity check failed")
        os.replace(temporary.name, output)
    finally:
        Path(temporary.name).unlink(missing_ok=True)
