'use strict';
const AtlasReplay08={
 events:[['Session start','start',0,0],['Admit the task','prompt',1,0],['Call P1','dispatch',1,1],['Before tool read','pretool',1,1],['Tool result admitted','posttool',1,1],['Call P2','dispatch',1,2],['Second tool result','posttool',1,2],['Call P3','dispatch',1,3],['Prepare compaction','precompact',1,3],['Checkpoint ready','postcompact',1,3],['User turn 2','prompt',2,3],['Call P4','dispatch',2,4]],
 normalize(value){return Math.max(0,Math.min(11,Math.trunc(Number(value)||0)));},
 methods(step){
  const base=[{layer:'skills',kit:'focus',label:'Load on demand',hook:'prompt',detail:'Catalog first; invoke only task-relevant skill bodies.'},{layer:'evidence',kit:'focus',label:'Focused packet',hook:'prompt',detail:'Select contracts and source anchors for the current task; keep all required instructions.'}];
  if(step>=3)base.push({layer:'history',kit:'results',label:step===3?'Bound read scope':[5,7].includes(step)?'Select results':'Bound results',hook:step===3?'pretool':[5,7].includes(step)?'dispatch':'posttool',detail:'Pre-tool scope plus a result wrapper/context adapter. Current Claude PostToolUse updatedToolOutput can replace model-visible output when its native shape is preserved; side effects and original telemetry remain.'});
  if(step>=8)base.push({layer:'checkpoint',kit:'continuity',label:'Preserve goal',hook:step===8?'precompact':'postcompact',detail:'Keep goal, constraints, source anchors and open work; validate and restore source facts before the next call.'});
  if(step>=10){base.unshift({layer:'task',kit:'continuity',label:'Latest goal',hook:step===10?'prompt':'dispatch',detail:'Carry the latest user goal and acceptance into the next request; context added for correctness is not treated as wasted input.'});base[2]={layer:'evidence',kit:'continuity',label:'Restore anchors',hook:'dispatch',detail:'Reload a bounded source packet referenced by the checkpoint.'};}
  return base;
 },
 at(value,path='managed',profile='platform'){
  const step=this.normalize(value),mode=AtlasWorkload.path(path),key=AtlasWorkload.profile(profile),cfg=AtlasWorkload.data.profiles[key],[label,hook,turn,call]=this.events[step],defs=AtlasWorkload.data.layers;
  const layers=defs.slice(0,4).map(l=>({...l,tokens:l.id==='skills'&&step===0?700:typeof l.tokens==='number'?l.tokens:l.tokens[mode]}));
  const add=(id,tokens)=>{if(tokens)layers.push({...defs.find(l=>l.id===id),tokens});};
  if(step>0){add('task',1500+(step>=10?500:0));if(step<9)add('evidence',cfg.evidence[mode]);else if(step>=10&&mode==='managed')add('evidence',2000);}
  if(step>=3&&step<9){const pieces=mode==='managed'?[500,1200,600,1200,700]:[1200,8000,1400,9000,1800],count=step>=8?5:step>=6?4:step>=4?2:1;add('history',Math.round(pieces.slice(0,count).reduce((n,x)=>n+x,0)*cfg.historyMultiplier));}
  if(step>=9)add('checkpoint',defs.find(l=>l.id==='checkpoint').tokens[mode]);
  return{step,path:mode,profile:key,label,hook,turn,call,session:'parent',layers,total:layers.reduce((n,l)=>n+l.tokens,0),methods:mode==='managed'&&step>0?this.methods(step):[],measured:false};
 },
 diff(value,path,profile){const now=this.at(value,path,profile),before=now.step?this.at(now.step-1,path,profile):null,a=new Map((before?.layers||[]).map(l=>[l.id,l])),b=new Map(now.layers.map(l=>[l.id,l]));return{now,before,net:now.total-(before?.total||0),rows:AtlasWorkload.data.layers.filter(l=>a.has(l.id)||b.has(l.id)).map(l=>{const x=a.get(l.id)?.tokens||0,y=b.get(l.id)?.tokens||0;return{...(b.get(l.id)||a.get(l.id)),previous:x,current:y,delta:y-x,change:x===y?'retained':!x?'added':!y?'removed':y>x?'extended':'reduced'};})};},
 scale(profile){return Math.max(...['managed','uncurated'].flatMap(p=>this.events.map((_,i)=>this.at(i,p,profile).total)));},
 summary(value,path,profile){const step=this.normalize(value);if(step!==8&&step!==9)return null;const input=this.at(8,path,profile),checkpoint=AtlasWorkload.data.layers.find(l=>l.id==='checkpoint').tokens[input.path];return{path:input.path,inputTokens:input.total+1000,parentTokens:input.total,summaryInstructionTokens:1000,outputTokens:step===9?checkpoint:null,parentAfter:step===9?this.at(9,path,profile).total:null,measured:false};},
 delegation(value,workers=1,profile='platform'){
  const step=Math.max(0,Math.min(6,Math.trunc(Number(value)||0))),n=Math.max(1,Math.min(3,Math.trunc(Number(workers)||1))),base=this.at(2,'managed',profile),evidence=base.layers.find(l=>l.id==='evidence').tokens,workTokens=12000,part=(v,i)=>Math.floor(v/n)+(i<v%n?1:0),workPartitions=Array.from({length:n},(_,i)=>part(workTokens,i)),sourcePartitions=Array.from({length:n},(_,i)=>part(evidence,i));
  const detail=[0,0,6000,12000,12000,15000,17000][step],report=step>=4?1200*n:0,verification=step>=5?3000:0,closing=step>=6?2000:0;
  const state=(kind,extra)=>({kind,total:base.total+extra,layers:[...base.layers,...(extra?[{id:'history',label:kind==='single'?'Work results + verification':'Validated reports + verification',role:'stored',tokens:extra}]:[])]});
  const single=state('single',detail),delegated=state('delegated',report+verification+closing),callsS=[{id:'P1',session:'parent',parent:true,tokens:base.total}],callsD=[{id:'P1',session:'parent',parent:true,tokens:base.total}];
  const childBase=14500+2500+900,uniqueWorkIDs=Array.from({length:12},(_,i)=>'work-'+(i+1)),uniqueSourceIDs=Array.from({length:8},(_,i)=>'source-'+(i+1)),workerWorkIDs=Array.from({length:n},(_,j)=>uniqueWorkIDs.filter((_,i)=>i%n===j)),workerSourceIDs=Array.from({length:n},(_,j)=>uniqueSourceIDs.filter((_,i)=>i%n===j));
  const sourceUnits=uniqueSourceIDs.map((id,i)=>({id,tokens:Math.floor(evidence/8)+(i<evidence%8?1:0)}));sourcePartitions.forEach((_,i)=>{sourcePartitions[i]=workerSourceIDs[i].reduce((sum,id)=>sum+sourceUnits.find(x=>x.id===id).tokens,0);});
  if(step>=2){callsS.push({id:'P2',session:'parent',parent:true,tokens:base.total+6000});sourcePartitions.forEach((x,i)=>callsD.push({id:'W'+(i+1)+'/C1',session:'child',parent:false,tokens:childBase+x+part(6000,i),sourceTokens:x,workTokens:part(6000,i),sourceIDs:workerSourceIDs[i],workInputIDs:workerWorkIDs[i].filter(id=>Number(id.split('-')[1])<=6)}));}
  if(step>=3){callsS.push({id:'P3',session:'parent',parent:true,tokens:base.total+12000});sourcePartitions.forEach((x,i)=>callsD.push({id:'W'+(i+1)+'/C2',session:'child',parent:false,tokens:childBase+x+workPartitions[i],sourceTokens:x,workTokens:workPartitions[i],sourceIDs:workerSourceIDs[i],workInputIDs:workerWorkIDs[i]}));}
  if(step>=5){callsS.push({id:'P4',session:'parent',parent:true,tokens:base.total+15000});callsD.push({id:'P2',session:'parent',parent:true,tokens:base.total+1200*n+3000});}
  if(step>=6){callsS.push({id:'P5',session:'parent',parent:true,tokens:base.total+17000});callsD.push({id:'P3',session:'parent',parent:true,tokens:base.total+1200*n+5000});}
  for(const [s,calls]of [[single,callsS],[delegated,callsD]]){s.calls=calls;s.aggregate=calls.reduce((t,c)=>t+c.tokens,0);s.parentPeak=Math.max(...calls.filter(c=>c.parent).map(c=>c.tokens));s.requestPeak=Math.max(...calls.map(c=>c.tokens));}
  return{step,workers:n,single,delegated,workTokens,workPartitions,sourcePartitions,uniqueWorkIDs,uniqueSourceIDs,sourceUnits,workerWorkIDs,workerSourceIDs,workAssumption:'Independent authored work units; native coordination costs and correctness are not measured.',childBase,measured:false,label:['Parent P1','Scope the workers','Work call 1','Work call 2','Validate handoff','Verify acceptance','Final parent call'][step]};
 }
};
