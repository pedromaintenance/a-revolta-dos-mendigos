/* Node contract for the local pixel atlas; run: node tests/pixel-frames.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'..','cinematic-pixel-frames.js'),'utf8');
const window={};
const canvases=[];
const document={createElement(name){
 assert.equal(name,'canvas');
 const calls=[],canvas={width:0,height:0,calls,
  getContext(type){assert.equal(type,'2d');return {
    imageSmoothingEnabled:true,fillStyle:'',
    fillRect(x,y,w,h){calls.push({x,y,w,h});}
  };}};
 canvases.push(canvas);return canvas;
}};
vm.runInNewContext(code,{window,document,console});
const frames=window.RevoltPixelFrames;
const poses=Array.from(frames.poses);
assert.deepEqual(poses,['idle','ready','strike','hurt','guard','down']);
const textures=new Map();
const actors=[];
const scene={
 textures:{
  exists(key){return textures.has(key)},
  addSpriteSheet(key,canvas,opts){
   assert.equal(canvas.width,480);
   assert.equal(canvas.height,120);
   assert.equal(opts.frameWidth,80);
   assert.equal(opts.frameHeight,120);
   textures.set(key,canvas);
  }
 },
 add:{sprite(x,y,key,index){
  const actor={active:true,x,y,key,index,changes:[],
   setOrigin(a,b){assert.equal(a,.5);assert.equal(b,1);return this;},
   setFrame(frame){this.changes.push(frame);return this;}};
  actors.push(actor);return actor;
 }}
};
const coto={id:'coto',side:'ally',name:'Coto',hp:20,maxhp:50};
const profile={heroId:'coto',coat:0x587e71,shadow:0x354e48,detail:0xd2b77b,hair:0x6b503b,
 court:false,knight:false,healer:false,caster:false};
const sprite1=frames.createFighter(scene,coto,true,profile);
assert.ok(sprite1);
for(const pose of poses.slice(1))sprite1.pose(pose);
assert.deepEqual(Array.from(actors[0].changes),[1,2,3,4,5]);
assert.ok(canvases[0].calls.length>200,'all six local poses must contain pixel shapes');
assert.equal(textures.size,1);
// Cache must reuse the texture but create a new render sprite.
const sprite2=frames.createFighter(scene,coto,true,profile);
assert.ok(sprite2);
assert.equal(textures.size,1);
assert.equal(actors.length,2);
// Facing the other way needs its own atlas (eye / stance mirrored).
const left=frames.createFighter(scene,coto,false,profile);
assert.ok(left);
assert.equal(textures.size,2);
assert.equal(frames.stats().atlases,2);
assert.equal(frames.stats().actors,3);
assert.equal(frames.stats().changes,5);
// Fallback path: a scene without a texture manager.
assert.equal(frames.createFighter({add:{}},coto,true,profile),null);
console.log('PASS six-frame local atlas, caching, facing, poses and fallback');
