import pathlib,zipfile,json
root=pathlib.Path(__file__).resolve().parents[1]/'docs'
with zipfile.ZipFile(root/'kits/context-kits.zip') as archive:
    files={str(p.relative_to(root/'kits')):p for p in (root/'kits').rglob('*') if p.is_file() and p.suffix!='.zip'}
    assert set(archive.namelist())==set(files),'ZIP file list must match the toolkit'
    for name,path in files.items():assert archive.read(name)==path.read_bytes(),name+' differs from tested source'
    assert 'context-menu/SKILL.md' in files and 'README.md' in files
bundle=(root/'atlas-kits08.js').read_text().split('const atlasKits08=',1)[1].rsplit(';',1)[0]
assert json.loads(bundle)==json.loads((root/'kits/catalog.json').read_text())
print('PASS downloadable ZIP/source fidelity, native reference skill/README and browser catalog')
