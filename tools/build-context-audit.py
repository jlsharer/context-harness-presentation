#!/usr/bin/env python3
"""Build deterministic public demo and offline skill archive from maintained sources."""
from pathlib import Path
import json, subprocess, zipfile, hashlib
root=Path(__file__).resolve().parent.parent
folder=root/'docs/audit/context-audit'; data=root/'docs/research/round13'
raw=subprocess.check_output(['node',str(folder/'scripts/cli.mjs'),'analyze','--claude-home',str(data),'--transcript',str(data/'demo-native.jsonl'),'--events',str(data/'demo-otel.jsonl')],text=True)
report=json.loads(raw)
def redact(value):
 if isinstance(value,dict):return {k:redact(v) for k,v in value.items()}
 if isinstance(value,list):return [redact(v)for v in value]
 if isinstance(value,str):return value.replace(str(root)+'/','')
 return value
report=redact(report);report['demonstration']='SYNTHETIC authored fixture; not a real session, observed savings or production benchmark.'
(data/'demo-report.json').write_text(json.dumps(report,indent=2)+'\n')
catalog=json.loads((folder/'catalog.json').read_text())
(root/'docs/atlas-audit13.js').write_text("'use strict';\nconst atlasAudit13="+json.dumps({'demo':report,'catalog':catalog,'checkedOn':'2026-11-12'},separators=(',',':'))+';\n')
archive=root/'docs/audit/context-audit.zip'; files=sorted(p for p in folder.rglob('*')if p.is_file()and'__pycache__'not in p.parts)
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED)as z:
 for p in files:
  info=zipfile.ZipInfo('context-audit/'+p.relative_to(folder).as_posix(),(2026,11,12,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,p.read_bytes())
with zipfile.ZipFile(archive)as z:
 assert z.testzip()is None
 for p in files:assert z.read('context-audit/'+p.relative_to(folder).as_posix())==p.read_bytes()
print('Built',len(files),'skill files; demo',report['metrics']['requests'],'requests;',len(report['findings']),'findings; ZIP SHA256',hashlib.sha256(archive.read_bytes()).hexdigest())
