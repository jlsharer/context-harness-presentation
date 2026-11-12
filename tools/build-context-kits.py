"""Rebuild the browser catalog and portable offline toolkit ZIP. No network/dependencies."""
import pathlib,json,zipfile
root=pathlib.Path(__file__).resolve().parents[1]/'docs'
catalog=json.loads((root/'kits/catalog.json').read_text())
(root/'atlas-kits08.js').write_text("'use strict';\nconst atlasKits08="+json.dumps(catalog)+';\n')
with zipfile.ZipFile(root/'kits/context-kits.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted((root/'kits').rglob('*')):
        if f.is_file() and f.suffix!='.zip':z.write(f,str(f.relative_to(root/'kits')))
print('Built context-kits.zip and matching browser catalog')
