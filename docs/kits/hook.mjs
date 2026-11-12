import {pathToFileURL,fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validateHandoff} from './core.mjs';
function saveToolArtifact(response){
 const directory=path.join(path.dirname(fileURLToPath(import.meta.url)),'artifacts');
 try{fs.mkdirSync(directory);}catch(error){if(error.code!=='EEXIST')throw error;}
 if(fs.lstatSync(directory).isSymbolicLink()||!fs.lstatSync(directory).isDirectory())throw Error('Artifact directory must be a real directory');
 const body=JSON.stringify(response),digest=createHash('sha256').update(body).digest('hex'),file=path.join(directory,digest+'.json');
 try{fs.writeFileSync(file,body,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;if(fs.lstatSync(file).isSymbolicLink()||!fs.lstatSync(file).isFile()||fs.readFileSync(file,'utf8')!==body)throw Error('Artifact path conflict');}
 return '.context-kit/artifacts/'+digest+'.json';
}
export function handleHook(event,mode){
 if(mode==='results'&&event.hook_event_name==='PostToolUse'&&event.tool_name==='Bash'){
  const r=event.tool_response;
  if(!r||typeof r.stdout!=='string'||typeof r.stderr!=='string'||r.stderr!==''||r.interrupted!==false||r.isImage!==false||r.error||(r.exitCode!==undefined&&r.exitCode!==0)||(r.exit_code!==undefined&&r.exit_code!==0)||r.stdout.length<=8000)return{};
  // Keep the original structured artifact. Only the model-visible stdout changes.
  const artifact=saveToolArtifact(r),suffix='\n[Preview truncated; full structured result: '+artifact+'. Read it when omitted facts matter.]';
  return{hookSpecificOutput:{hookEventName:'PostToolUse',updatedToolOutput:{...r,stdout:r.stdout.slice(0,8000-suffix.length)+suffix}}};
 }
 if(mode==='continuity'&&event.hook_event_name==='UserPromptSubmit')return{hookSpecificOutput:{hookEventName:'UserPromptSubmit',additionalContext:'Use the latest user request as the current goal. Keep required constraints and acceptance checks explicit. Resolve conflicts by native instruction authority. Verify the artifact against this goal before finishing.'}};
 if(mode==='continuity'&&event.hook_event_name==='PreCompact')return'Preserve the latest goal, constraints, source anchors, decisions, open work and acceptance checks. Do not claim checks passed without results. Restore referenced source facts when needed after compaction.';
 if(mode==='handoff'&&event.hook_event_name==='SubagentStart')return{hookSpecificOutput:{hookEventName:'SubagentStart',additionalContext:'Stay within the delegated task and source scope. Return a JSON report with task_id, summary, source_anchors, findings, checks (command/status), open_questions. State not-run for checks without results. Validate with the context-kit helper before handoff.'}};
 if(mode==='handoff'&&event.hook_event_name==='PreToolUse'&&event.tool_name==='SubagentHandback'){
  try{const message=event.tool_input?.message;if(typeof message==='string'&&Buffer.byteLength(message,'utf8')>12000)throw Error('Delivered message exceeds 12000 UTF-8 bytes');validateHandoff(typeof message==='string'?JSON.parse(message):message);return{};}
  catch(error){return{hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'deny',permissionDecisionReason:'Handoff structure invalid: '+error.message}};}
 }
 return{};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){let raw='';for await(const chunk of process.stdin)raw+=chunk;const output=handleHook(JSON.parse(raw||'{}'),process.argv[2]);process.stdout.write(typeof output==='string'?output:JSON.stringify(output));}
