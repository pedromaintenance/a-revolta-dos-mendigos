/* Node smoke tests for the browser cinematic contract.
 * Run: node tests/cinematic-contract.test.js
 * These are deterministic integration/contract checks, NOT browser visual QA.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const app=read('app.js'),scene=read('phaser-battle.js'),popup=read('battle-popup.js');
const lab=read('tactical-lab.html');
const html=read('index.html'),sw=read('sw.js');
const test=(name,fn)=>{fn();process.stdout.write('PASS '+name+'\n')};
test('all active browser scripts parse',()=>{
 for(const file of ['app.js','phaser-battle.js','battle-popup.js','sw.js','tactical-core.js'])
  assert.doesNotThrow(()=>new vm.Script(read(file),{filename:file}));
 const inline=lab.match(/<script>\s*([\s\S]*?)<\/script>/);
 assert.ok(inline,'inline tactical lab script');
 assert.doesNotThrow(()=>new vm.Script(inline[1]));
});
test('main release and service worker share version',()=>{
 const version=html.match(/app\.js\?v=(\d+)/)?.[1];
 assert.ok(version,'app version');
 assert.ok(html.includes('phaser-battle.js?v='+version));
 assert.ok(html.includes('battle-popup.js?v='+version));
 assert.ok(sw.includes('revolta-cache-v'+version));
 assert.ok(sw.includes("'./battle-popup.js'"));
});
test('rules engine queues all three event kinds',()=>{
 assert.ok(app.includes("queueBattleSupport('heal'"));
 assert.ok(app.includes("queueBattleSupport('guard'"));
 assert.ok(app.includes("battleVisualEvents.push({kind:'attack',ability,attackerBefore:source"));
 assert.ok(app.includes("if(started)battleVisualEvents.splice(0,events.length)"));
});
test('renderer passes event kind, keeps skip controls',()=>{
 assert.ok(scene.includes("kind:event.kind||'attack'"));
 assert.ok(scene.includes('onSkipAll:finish'));
 assert.ok(popup.includes("kind==='heal'"));
 assert.ok(popup.includes("kind==='guard'"));
 assert.ok(popup.includes('options.onSkipAll()'));
});
test('direct previews are discoverable and isolated',()=>{
 assert.ok(lab.includes('id="demoType"'));
 for(const choice of ['attack','heal','guard','sequence'])
  assert.ok(lab.includes('value="'+choice+'"'));
 assert.ok(lab.includes('function demoEvents(mode)'));
 assert.ok(!lab.includes("localStorage.setItem("));
});
test('tactical core remains deterministic',()=>{
 const sandbox={};vm.createContext(sandbox);vm.runInContext(read('tactical-core.js'),sandbox);
 const T=sandbox.RevoltTactics;
 assert.equal(T.passable(4,3),true);
 assert.equal(T.passable(4,5),false);
 let s=T.initial();s.units[0].x=7;s.units[0].y=3;s=T.dispatch(s,{type:'select',id:'coto'});
 s=T.dispatch(s,{type:'attack'});
 assert.equal(s.units[1].hp,18);
 assert.equal(s.units[0].hp,26);
});

test('pixel cut-in uses local palette and distinct equipment',()=>{
 assert.ok(popup.includes('Local procedural pixel sprites'));
 assert.ok(popup.includes('const healer='));
 assert.ok(popup.includes('const knight='));
 assert.ok(popup.includes('const caster='));
 assert.ok(popup.includes('scene.add.graphics()'));
 assert.ok(popup.includes('const weapon=scene.add.container('));
 assert.ok(popup.includes('targets:attacker.weapon'));
});

test('finisher and enemy cinematic previews are available',()=>{
 for(const option of ['finisher','enemy'])assert.ok(lab.includes('value="'+option+'"'));
 assert.ok(popup.includes("fatal=kind==='attack'"));
 assert.ok(popup.includes("'✦ GOLPE FINAL ✦'"));
 assert.ok(popup.includes('FOI DERROTADO'));
});

test('all eight canonical hero profiles and roster showcase exist',()=>{
 for(const id of ['coto','marga','iria','silas','olmo','dara','vega','lorena']){
  assert.ok(popup.includes(id+':{coat:'),'missing palette for '+id);
  assert.ok(lab.includes("['"+id+"',"),'missing showcase for '+id);
 }
 assert.ok(lab.includes('value="roster"'));
 assert.ok(popup.includes("weaponType==='hammer'"));
 assert.ok(popup.includes("weaponType==='dagger'"));
 assert.ok(popup.includes("weaponType==='spear'"));
 assert.ok(popup.includes("weaponType==='shield'"));
});

test('weapon animation timing and effects remain defined',()=>{
 for(const kind of ['dagger','hammer','spear','staff','shield'])
  assert.ok(popup.includes("style==='"+kind+"'"),'missing attack archetype '+kind);
 assert.ok(popup.includes('const impact=release+'));
 assert.ok(popup.includes('delay(impact,()=>'));
 assert.ok(popup.includes('endTime=impact+'));
 assert.ok(popup.includes('targets:attacker.weapon'));
});

test('arcane cinematics use distinct cast and impact motifs',()=>{
 assert.ok(lab.includes('value="arcana"'));
 assert.ok(lab.includes("['vega','olmo','marga']"));
 for(const type of ['embers','chorus','blessing'])assert.ok(popup.includes("'"+type+"'"));
 assert.ok(popup.includes("magicMotif(xAtt,yChar-76,'cast')"));
 assert.ok(popup.includes("magicMotif(xDef,241,'hit')"));
});

test('canonical skill metadata reaches the Phaser presentation',()=>{
 assert.ok(app.includes("function fightDamage(enemy,dmg,src,ability=null,sourceId=null)"));
 assert.ok(app.includes("battleVisualEvents.push({kind:'attack',ability"));
 assert.ok(app.includes('function queueBattleSupport(kind,caster,target,hpBefore,ability=null)'));
 assert.ok(app.includes("queueBattleSupport('guard',h,z,z.hp,'baluarte')"));
 assert.ok(scene.includes("ability:event.ability||null"));
 assert.ok(popup.includes("const ability=String(options.ability||'').toLowerCase()"));
 for(const skill of ['levante','partilha','sombra','martelo','canto','rede','brasa','baluarte'])
   assert.ok(popup.includes(skill+':'),'missing visual label for '+skill);
});
test('ability showcase, runtime tests and browser tests remain reachable',()=>{
 assert.ok(lab.includes('value="skills"'));
 assert.ok(lab.includes("mode==='skills'?abilityShowcase"));
 assert.doesNotThrow(()=>new vm.Script(read('tests/cinematic-runtime.test.js')));
 assert.doesNotThrow(()=>new vm.Script(read('tests/browser-smoke.cjs')));
});
