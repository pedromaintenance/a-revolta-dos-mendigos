/* Run with node tests/tactics.test.js */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','tactical-core.js'),'utf8');
const context={};vm.runInNewContext(source,context);
const T=context.RevoltTactics;
function test(name,fn){try{fn();process.stdout.write('PASS '+name+'\n')}catch(e){process.stderr.write('FAIL '+name+'\n');throw e}}
test('bridge accessible while deep water blocked',()=>{
 assert.equal(T.passable(4,3),true);
 assert.equal(T.passable(4,5),false);
 assert.equal(T.passable(3,3),true);
});
test('reachable rejects obstacles and occupied tiles',()=>{
 const s=T.initial(),places=T.reachable(s,'coto');
 assert.ok(places.length>0);
 assert.ok(!places.some(p=>T.walls.has(T.key(p.x,p.y))));
 assert.ok(!places.some(p=>p.x===8&&p.y===3));
});
test('move uses action and cannot move twice',()=>{
 let s=T.dispatch(T.initial(),{type:'select',id:'coto'});
 const p=T.reachable(s,'coto')[0];
 s=T.dispatch(s,{type:'move',x:p.x,y:p.y});
 assert.equal(s.moved,true);
 const original=[s.units[0].x,s.units[0].y].join(',');
 s=T.dispatch(s,{type:'move',x:1,y:4});
 assert.equal([s.units[0].x,s.units[0].y].join(','),original);
});
test('invalid long range attack causes no damage',()=>{
 let s=T.dispatch(T.initial(),{type:'select',id:'coto'});
 const hp=s.units[1].hp;s=T.dispatch(s,{type:'attack'});assert.equal(s.units[1].hp,hp);
});
test('adjacent attack damages defender and counterattacks',()=>{
 let s=T.initial();s.units[0].x=7;s.units[0].y=3;s=T.dispatch(s,{type:'select',id:'coto'});
 s=T.dispatch(s,{type:'attack'});
 assert.ok(s.units[1].hp<28);
 assert.ok(s.units[0].hp<32);
 assert.equal(s.attacked,true);
});
test('enemy phase ends and restores movement',()=>{
 let s=T.dispatch(T.initial(),{type:'select',id:'coto'});
 s=T.dispatch(s,{type:'end'});
 assert.equal(s.phase,'player');assert.equal(s.turn,2);assert.equal(s.moved,false);
});
test('victory ends battle',()=>{
 let s=T.initial();s.units[0].x=7;s.units[0].y=3;s.units[1].hp=1;
 s=T.dispatch(s,{type:'select',id:'coto'});s=T.dispatch(s,{type:'attack'});
 assert.equal(s.over,true);assert.equal(s.win,true);
});
