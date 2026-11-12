'use strict';
const atlasWorkloadData={"version":1,"evidence":"modeled-token-budgets","measuredSavings":false,"scope":"Assigned scenario budgets, not tokenized text, native usage, typical costs or measured policy gains. Logical teaching load order is not captured native serialization.","measuredSource":"benchmark-data/measured-service.json","measuredSourceSha256":"16698c7b12859aed0dbcf8f9e8ba69a8ed5db5fff15cbec54856428be457c77b","observedRuns":[{"id":"service-1-incident-recovery-A","peakInput":26783,"accepted":false},{"id":"service-2-incident-recovery-B","peakInput":55993,"accepted":true},{"id":"service-3-incident-recovery-C","peakInput":51792,"accepted":true},{"id":"service-4-holds-invoices-B","peakInput":49777,"accepted":true},{"id":"service-5-holds-invoices-C","peakInput":55427,"accepted":true},{"id":"service-6-holds-invoices-A","peakInput":31397,"accepted":true}],"observedLimits":"Six recorded runs across different arms/tasks. Peak inputs are per-run maxima; not a matched managed-vs-uncurated estimate. Complete native/provider prompts were not retained.","profiles":{"service":{"label":"Focused service","files":"50-file incident fixture \u2192 larger service workflow","evidence":{"uncurated":12000,"managed":4500},"historyMultiplier":1},"platform":{"label":"Platform monorepo","files":"Several packages, shared contracts and organization guidance","evidence":{"uncurated":28000,"managed":8000},"historyMultiplier":1.5},"org":{"label":"Large organization workflow","files":"Many packages and shared skills; broader repository discovery","evidence":{"uncurated":62000,"managed":14000},"historyMultiplier":2}},"layers":[{"id":"base","label":"Harness + model instructions","role":"policy","tokens":4000,"detail":"Instruction allowance held constant in both paths. Exact hidden provider instructions and native system prompts were not captured; this is an assumption, not a reconstructed prompt."},{"id":"tools","label":"Tool definitions + contracts","role":"execution","tokens":6500,"detail":"Schemas and tool contracts held constant. No required tool definitions are removed by the managed policy. Tool results are counted separately in history."},{"id":"guidance","label":"Applicable AGENTS.md guidance","role":"policy","tokens":4000,"detail":"Global, organization, repository and workspace guidance as applicable to the chosen harness. Preserve all required rules in documented native order; arbitrary nested files are not all automatically loaded."},{"id":"skills","label":"Skill catalog + invoked bodies","role":"policy","tokens":{"uncurated":6700,"managed":2500},"detail":"Both paths include a 700-token catalog allowance. Uncurated workflow explicitly invokes/pastes 6000 tokens of skill bodies; managed workflow invokes 1800 relevant tokens. Native discovery is not assumed to load every skill body automatically."},{"id":"task","label":"Current task + acceptance","role":"evidence","tokens":1500,"detail":"Same task, constraints and acceptance requirements in both paths. Turn 2 adds a 500-token follow-up allowance. No task requirement is dropped."},{"id":"evidence","label":"Selected repository evidence","role":"evidence","detail":"Uncurated workflow reads broad package material; managed workflow selects dependency-relevant files/contracts. Full artifacts remain retrievable. Amounts are scenario assumptions."},{"id":"history","label":"Conversation + tool results","role":"stored","detail":"Selected messages and tool output. Each event adds its own authored allowance only after that output exists. Managed path bounds/summarizes returned material; no quality or accuracy gain is measured."},{"id":"checkpoint","label":"Checkpoint + source anchors","role":"stored","tokens":{"uncurated":6000,"managed":2000},"detail":"Both paths compact at the same teaching boundary. Uncurated checkpoint gets a 6000-token allowance; managed checkpoint gets 2000 with required facts/anchors and a restoration check. This is not measured summary quality or native trigger timing."}]};
// Workload budgets are a teaching model. They are deliberately separate from AtlasSession's exact-text tokenizer data.
const AtlasWorkload={
 data:atlasWorkloadData,
 profile(value){return Object.hasOwn(this.data.profiles,value)?value:'platform';},
 path(value){return value==='managed'?'managed':'uncurated';},
 at(value,path='managed',profile='platform'){
  const step=AtlasSession.normalize(value),event=AtlasSession.events[step],p=this.path(path),key=this.profile(profile),cfg=this.data.profiles[key],child=event.session==='child';
  const layers=this.data.layers.slice(0,4).map(l=>({...l,tokens:typeof l.tokens==='number'?l.tokens:l.tokens[p]}));
  if(step===0)layers.find(l=>l.id==='skills').tokens=700;
  const definition=id=>this.data.layers.find(l=>l.id===id),push=(id,tokens,extra={})=>{if(tokens>0)layers.push({...definition(id),tokens,...extra});};
  if(step>0){
   push('task',child?900:1500+(step>=12?500:0));
   if(step<11)push('evidence',child?(p==='managed'?2500:Math.round(cfg.evidence[p]*0.65)):cfg.evidence[p]);
   else if(step>=12&&p==='managed')push('evidence',2000,{label:'Restored source anchors',detail:'Managed next-dispatch restoration allowance. Validate the required source facts before proceeding; this is not proof of semantic retention.'});
  }
  if(!child&&step>=3&&step<11){
   const pieces=p==='managed'?[500,1200,600,1200,700]:[1200,8000,1400,9000,1800];
   const n=step>=10?5:step>=8?4:step>=4?2:1;
   push('history',Math.round(pieces.slice(0,n).reduce((a,b)=>a+b,0)*cfg.historyMultiplier));
  }
  if(step>=11)push('checkpoint',definition('checkpoint').tokens[p]);
  const note=step===6||step===7?'Fresh child input; parent history is not automatically copied.':step===8?'Selected child handoff joins the parent; the child window stays separate.':step===10?'Each lane prepares its own auxiliary S1 request; S1 input is not added to the parent.':step===11?'Shared compaction boundary: replace old evidence/history with each lane’s own checkpoint. Native trigger timing is not modeled.':step>=12?'Turn 2 adds the same request. Managed next-dispatch policy restores a bounded source packet.':'Same required instruction/tool/guidance allowances; different optional context selection and retention.';
  return{...event,step,path:p,profile:key,layers,total:layers.reduce((n,l)=>n+l.tokens,0),note,measured:false};
 },
 diff(value,path,profile){
  const now=this.at(value,path,profile),step=now.step,ref=step===0||step===6?null:step===8?5:step-1,before=ref===null?null:this.at(ref,path,profile);
  if(before&&before.session!==now.session)throw Error('Cross-session budget comparison');
  const a=new Map((before?.layers||[]).map(l=>[l.id,l])),b=new Map(now.layers.map(l=>[l.id,l]));
  const ids=this.data.layers.map(l=>l.id).filter(id=>a.has(id)||b.has(id));
  const rows=ids.map(id=>{const old=a.get(id),current=b.get(id),x=old?.tokens||0,y=current?.tokens||0;return{...(current||old),previous:x,current:y,change:x===y?'retained':!x?'added':!y?'removed':y>x?'extended':'reduced',delta:y-x};});
  return{now,before,rows,net:now.total-(before?.total||0),reference:before?before.session+' · '+before.label:'New '+now.session+' input · empty baseline'};
 },
 scale(profile){return Math.max(...['uncurated','managed'].flatMap(p=>AtlasSession.events.map((e,i)=>this.at(i,p,profile).total)));},
 summary(value,path,profile){
  const step=AtlasSession.normalize(value);if(step!==10&&step!==11)return null;const parent=this.at(10,path,profile),instructions=1000;
  return{id:'S1',session:'parent',path:parent.path,inputTokens:parent.total+instructions,instructionTokens:instructions,parentTokens:parent.total,outputTokens:step===11?this.data.layers.find(l=>l.id==='checkpoint').tokens[parent.path]:null,measured:false};
 }
};
