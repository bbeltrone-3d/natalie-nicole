// Run with: node test-competition-rotation.cjs
// Exercises the actual scripts embedded in index.html without network or dependencies.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,2);
class Element {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.attributes={};this.hidden=false;this._text='';}
 set textContent(text){this._text=String(text);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this._text='';this.children=children;}
 setAttribute(key,value){this.attributes[key]=value;}
 getAttribute(key){return key==='src'?this.src:this.attributes[key];}
}
function boot(instant,mutate=()=>{}){
 let clock=Date.parse(instant),timer,timerDelay;
 const elements=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 const metas={},events={};
 class Clock extends Date{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
 const document={hidden:false,getElementById:id=>elements[id],createElement:tag=>new Element(tag),
  createTextNode:text=>{const n=new Element('#text');n.textContent=text;return n;},
  querySelector:selector=>metas[selector]||(metas[selector]={}),addEventListener:(name,fn)=>events[name]=fn};
 const window={addEventListener:(name,fn)=>events[name]=fn};
 const context={window,document,Date:Clock,Intl,URL,setTimeout:(fn,ms)=>{timer=fn;timerDelay=ms;return 1;},clearTimeout:()=>{}};
 vm.createContext(context);vm.runInContext(scripts[0],context);mutate(window.NATALIE_CAMPAIGN);vm.runInContext(scripts[1],context);
 return {elements,document,config:window.NATALIE_CAMPAIGN,
  priority:()=>elements['competition-list'].children.find(n=>n.className==='competition featured')?.children[0]._text||null,
  advance:(instant,event)=>{clock=Date.parse(instant);(event?events[event]:timer)();},
  delay:()=>timerDelay};
}
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('October 23 rankings and rounds are an explicitly dated manual snapshot',()=>{
 const app=boot('2026-10-23T18:54:00Z');
 assert.equal(app.config.snapshotDate,'2026-10-23');
 const expected={
  'IVY Swimwear':[3,11,'Finals'],
  'Salty Mermaid Runway':[6,26,'Semi-Final Wild Card'],
  'Elegance – Vienna':[11,17,'Finals'],
  'Radiance 2026':[5,13,'Finals Wild Card'],
  'Centerfold 2026':[4,null,'Finals Wild Card'],
  'Natural Beauty 2026':[12,15,'Finals']
 };
 for(const row of app.config.competitions) assert.deepEqual([row.rank,row.total,row.round],expected[row.name]);
 assert.equal(app.priority(),'IVY Swimwear');
 assert.match(app.elements.recorded.textContent,/October 23, 2026 · not live/);
 assert.match(app.elements['hero-intro'].textContent,/snapshot, Natalie was 3rd of 11/);
 assert.doesNotMatch(app.elements['hero-intro'].textContent,/currently/);
 assert.equal(app.elements.bonus.hidden,true);
});
test('IVY cutoff is October 23 EDT / October 24 UTC, never a bare date',()=>{
 const app=boot('2026-10-24T00:59:59.999Z');
 assert.equal(app.priority(),'IVY Swimwear');
 assert.equal(app.delay(),1);
 app.advance('2026-10-23T21:00:00-04:00');
 assert.equal(app.priority(),'Natural Beauty 2026');
 assert.match(app.elements['vote-label'].textContent,/NATURAL BEAUTY/);
 assert.equal(app.elements['step-competition'].textContent,'NATURAL BEAUTY');
 assert.match(app.elements['hero-intro'].textContent,/snapshot, Natalie was 12th of 15/);
 assert.equal(app.elements['hero-image'].src,'gallery/11_outdoor_tree.jpg');
 assert.match(app.document.title,/Natural Beauty/);
 assert.equal(app.elements['competition-list'].children.length,6);
 assert.match(app.elements['competition-list'].children[1].textContent,/Estimated close passed/);
});
test('equal-time rounds keep original order; all expired rounds are skipped',()=>{
 const cases=[
  ['2026-10-26T20:59:59-04:00','Natural Beauty 2026'],
  ['2026-10-26T21:00:00-04:00','Elegance – Vienna'],
  ['2026-10-27T21:00:00-04:00','Salty Mermaid Runway'],
  ['2026-10-28T21:00:00-04:00','Centerfold 2026'],
  ['2026-10-29T21:00:00-04:00',null]
 ];
 for(const [instant,name] of cases) assert.equal(boot(instant).priority(),name);
});
test('estimated deadlines are not presented as verified cutoffs',()=>{
 const app=boot('2026-10-23T18:54:00Z');
 assert.match(app.elements.deadline.textContent,/Expected close.*Oct 23.*9:00 PM EDT.*estimate/);
 for(const row of app.config.competitions){assert.equal(row.deadlineVerified,false);assert.equal(row.dateIso,null);}
});
test('a subsequently verified absolute deadline supersedes an estimate',()=>{
 const app=boot('2026-10-24T01:00:00Z',c=>{
  const ivy=c.competitions.find(r=>r.name==='IVY Swimwear');
  ivy.dateIso='2026-10-23T22:00:00-04:00';ivy.deadlineVerified=true;
 });
 assert.equal(app.priority(),'IVY Swimwear');
 assert.match(app.elements.deadline.textContent,/^Closes.*10:00 PM EDT/);
 app.advance('2026-10-24T02:00:00Z');assert.equal(app.priority(),'Natural Beauty 2026');
});
test('unknown, invalid, date-only and not-yet-started rounds are not falsely promoted',()=>{
 const app=boot('2026-10-23T18:54:00Z',c=>{
  for(const row of c.competitions){row.dateIso='2026-10-30';row.deadlineVerified=true;row.estimatedCloseIso=null;row.sortDate='2026-10-30';}
  c.competitions[0].estimatedCloseIso='invalid';
  c.competitions[1].estimatedCloseIso='2026-10-24T01:00:00Z';c.competitions[1].startsIso='2026-10-23T20:00:00Z';
 });
 assert.equal(app.priority(),null);
 app.advance('2026-10-23T20:00:00Z');assert.equal(app.priority(),'IVY Swimwear');
});
test('suspended tabs and back-forward restores recalculate without duplicated cards',()=>{
 const app=boot('2026-10-23T20:59:00-04:00');
 app.advance('2026-10-23T21:01:00-04:00','visibilitychange');
 assert.equal(app.priority(),'Natural Beauty 2026');
 app.advance('2026-10-28T21:01:00-04:00','pageshow');
 assert.equal(app.priority(),'Centerfold 2026');
 assert.equal(app.elements['competition-list'].children.length,6);
 assert.match(app.elements['snapshot-note'].textContent,/Archived snapshot/);
 assert.match(app.elements.recorded.textContent,/October 23, 2026/);
 assert.equal(app.elements['hero-rank'].textContent,'#4 ');
});
test('all rounds elapsed shows results, never a stale voting priority',()=>{
 const app=boot('2026-10-30T12:00:00Z');
 assert.equal(app.priority(),null);
 assert.equal(app.elements['vote-label'].textContent,'View official results');
 assert.equal(app.elements['expired-note'].hidden,false);
 assert.equal(app.elements['hero-rank'].textContent,'—');
 assert.equal(app.elements['vote-button'].href,'https://models.maxim.com/t/SJV3LHC5');
});
test('gallery and section navigation remain present',()=>{
 const images=[...html.matchAll(/<img src="(gallery\/[^\"]+)"/g)].map(m=>m[1]);
 assert.equal(images.length,12);assert.equal(new Set(images).size,12);
 for(const id of ['standings','story','gallery']){assert.ok(html.includes('href="#'+id+'"'));assert.ok(html.includes('id="'+id+'"'));}
 assert.match(html,/<img id="vote-qr" src="data:image/);
 assert.match(html,/<a class="primary" id="vote-button" href="https:\/\/models.maxim.com\/t\/SJV3LHC5"/);
});
console.log(`${passed} tests passed (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`);
