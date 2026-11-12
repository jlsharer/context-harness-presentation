'use strict';
const AtlasLearning={
 nodes:[['api','API'],['service','Service'],['journal','Journal'],['delivery','Delivery'],['ui','UI']],
 edges:[['api','service'],['service','journal'],['service','delivery']],
 hop(value){const depth=Math.max(0,Math.min(2,Math.trunc(Number(value)||0)));let frontier=['api'];const seen=new Set(frontier);for(let i=0;i<depth;i++){const next=[];for(const node of frontier)for(const [from,to] of this.edges)if(from===node&&!seen.has(to)){seen.add(to);next.push(to);}frontier=next;}return frontier;},
 score(ids){const selected=new Set(ids),expected=new Set(this.hop(2)),correct=[...selected].filter(id=>expected.has(id)).length,precision=selected.size?correct/selected.size:0,recall=correct/expected.size;return{precision:100*precision,recall:100*recall,f1:precision+recall?200*precision*recall/(precision+recall):0,correct,selected:selected.size,expected:expected.size};},
 allowed(value){const q=Math.max(0,Math.min(7,Math.trunc(Number(value)||0)));return Array.from({length:q+1},(_,i)=>i);},
 positions:['Policy','Tools','AGENTS','Fact A','Other text','Fact B','Task','Answer']
};
