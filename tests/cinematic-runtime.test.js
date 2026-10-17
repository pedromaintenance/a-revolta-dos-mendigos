/* Exercita os eventos cinematográficos com um Phaser mínimo simulado.
 * Run: node tests/cinematic-runtime.test.js
 * O mock valida callbacks, efeitos e fluxo; pixels reais são testados no browser smoke.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const popup=fs.readFileSync(path.join(__dirname,'..','battle-popup.js'),'utf8');
const browser={};
vm.runInNewContext(popup,{window:browser});
const cases=[
 ['brasa','attack','vega'],['rede','attack','dara'],['sombra','attack','iria'],
 ['martelo','attack','silas'],['levante','attack','coto'],['partilha','heal','marga'],
 ['canto','heal','olmo'],['baluarte','guard','lorena'],['graca','heal','paladino'],
 ['pacto','attack','cavaleiro'],['defender','guard','coto'],['ervas','heal','marga']
];
function object(kind,x=0,y=0){
 return {kind,x,y,alpha:1,active:true,children:[],
  setOrigin(){return this},setDepth(){return this},setInteractive(){return this},
  setStrokeStyle(){return this},setRotation(){return this},setText(){return this},
  add(v){this.children.push(...(Array.isArray(v)?v:[v]));return this},
  on(ev,cb){this.handler=cb;return this},
  destroy(){this.active=false;return this},fillStyle(){return this},
  fillRect(){return this},lineStyle(){return this},lineBetween(){return this}};
}
function mockScene(){
 const jobs=[],objects=[];let elapsed=0;
 const make=(kind,...args)=>{const o=object(kind,args[0],args[1]);objects.push(o);return o};
 const scene={
  sys:{isActive:()=>true},scale:{height:460},
  time:{delayedCall(ms,cb){
   const job={when:elapsed+ms,cb,removed:false,remove(){this.removed=true}};
   jobs.push(job);return job;
  }},
  tweens:{add(options){if(options.onComplete)scene.time.delayedCall(options.duration||10,options.onComplete);return {}}},
  cameras:{main:{shake(){}}},add:{}
 };
 for(const kind of ['zone','container','rectangle','circle','text','ellipse','star','triangle','polygon','graphics']){
  scene.add[kind]=(...args)=>make(kind,...args);
 }
 return {scene,objects,run(){
  let steps=0;
  while(jobs.length){
   assert.ok(++steps<3000,'timer loop');
   jobs.sort((a,b)=>a.when-b.when);
   const next=jobs.shift();elapsed=next.when;if(!next.removed)next.cb();
  }
 }};
}
for(const [ability,kind,id] of cases){
 const {scene,run}=mockScene();let done=0;
 const source={id,side:'ally',name:id,hp:15,maxhp:30};
 const target=kind==='attack'?{id:'guarda',side:'enemy',name:'Guarda',hp:24,maxhp:30}
  :{id:'coto',side:'ally',name:'Coto',hp:13,maxhp:30};
 const after={...target,hp:kind==='attack'?10:kind==='heal'?22:target.hp};
 browser.RevoltBattlePopup.play(scene,{
  kind,ability,before:{units:[source,target]},after:{units:[source,after]},
  attackerId:source.id,defenderId:target.id,onDone:()=>done++
 });
 run();assert.equal(done,1,'expected exactly one completion for '+ability);
 console.log('PASS cinematic ability '+ability);
}
// Test skip-all callback, using the actual interactive rectangle handler.
{
 const {scene,objects,run}=mockScene();let done=0,skipped=0;
 const a={id:'coto',side:'ally',name:'Coto',hp:30,maxhp:30};
 const d={id:'guarda',side:'enemy',name:'Guarda',hp:25,maxhp:25};
 browser.RevoltBattlePopup.play(scene,{
  kind:'attack',ability:'levante',before:{units:[a,d]},
  after:{units:[a,{...d,hp:15}]},attackerId:a.id,defenderId:d.id,
  sequencePosition:1,sequenceTotal:3,onDone:()=>done++,onSkipAll:()=>skipped++
 });
 const button=objects.find(o=>o.kind==='rectangle'&&o.x===91&&o.y===390&&o.handler);
 assert.ok(button,'skip-all control should be interactive');
 button.handler();run();
 assert.equal(done,0);assert.equal(skipped,1);
 console.log('PASS skip-all once without completing current event');
}
