/* RPG Carcaça — locally generated frame atlas for cinematic combat.
 * Each character has six 20×30 pixel poses on one canvas spritesheet.
 * This module changes drawing only; never combat rules or HP.
 */
(function(root){
'use strict';
const TILE=4, WIDTH=20, HEIGHT=30;
const POSES=['idle','ready','strike','hurt','guard','down'];
const index=Object.fromEntries(POSES.map((pose,i)=>[pose,i]));
const metrics={atlases:0,actors:0,changes:0};
function hex(color){return '#'+Number(color).toString(16).padStart(6,'0');}
function drawPose(ctx,pose,meta,faceRight,offset){
 const {coat,shadow,detail,hair,heroId,court,knight,healer,caster}=meta;
 const is=pose=== 'strike',ready=pose==='ready',hurt=pose==='hurt';
 const guard=pose==='guard',down=pose==='down';
 const move=is?(faceRight?2:-2):hurt?(faceRight?-1:1):0;
 const crouch=guard?2:down?4:0;
 // Every shape is quantized to pixels; the sheet is enlarged with no smoothing.
 const p=(x,y,w,h,c)=>{
  ctx.fillStyle=hex(c);
  ctx.fillRect((offset+x)*TILE,y*TILE,w*TILE,h*TILE);
 };
 p(3,28,14,1,0x18232a); // shadow
 if(!down){
  p(5+move,21,4,6,0x303b42);
  p(11+move,21,4,6,0x303b42);
  p(4+move,26,5,2,0x252c35);
  p(11+move,26,5,2,0x252c35);
 }else{
  p(3,25,7,3,0x252c35);
  p(10,26,8,2,0x303b42);
 }
 const by=11+crouch;
 const bx=4+move;
 p(bx,by,12,12,shadow);
 p(bx+1,by+1,10,10,coat);
 p(bx+3,by+4,6,5,detail);
 p(bx+1,by+9,10,2,shadow);
 p(bx+5,by+8,2,3,0x4a3637);
 // Arms have independent silhouettes for ready/attack/hurt/guard.
 if(is){
  p(bx-2,by+1,6,3,shadow);
  p(bx+10,by+1,7,3,coat);
  p(bx+15,by+1,3,2,0xd4ad8f);
 }else if(ready){
  p(bx-2,by-2,3,8,shadow);
  p(bx+11,by-3,3,8,shadow);
  p(bx+11,by-4,3,2,0xd4ad8f);
 }else if(guard){
  p(bx-3,by+2,5,8,shadow);
  p(bx+10,by+2,5,8,coat);
 }else if(hurt||down){
  p(bx-2,by+4,4,8,shadow);
  p(bx+11,by+4,4,8,shadow);
 }else{
  p(bx-1,by+1,3,9,shadow);
  p(bx+11,by+1,3,9,shadow);
 }
 const hy=(down?9:ready?3:4)+crouch;
 const hx=6+move;
 p(hx,hy,8,9,0xe0b796);
 p(hx-1,hy-1,10,4,court?0x45404c:0x503a36);
 p(hx,hy-2,8,2,hair);
 if(pose!=='hurt'&&pose!=='down')p(faceRight?hx+6:hx+1,hy+5,2,1,0x242c35);
 else p(hx+2,hy+6,3,1,0x693f47);
 p(hx+2,hy+8,4,2,shadow);
 if(knight){
  p(hx-1,hy-1,10,2,0x6e8290);
  p(hx-2,hy+1,2,6,0x8797a0);
  p(hx+8,hy+1,2,6,0x8797a0);
  p(bx+3,by+4,6,3,0xb2b5b6);
 }
 if(healer){
  p(hx-2,hy,12,3,0xd1be82);
  p(bx+4,by+3,4,1,0xf4df9b);
  p(bx+5,by+2,2,5,0xf4df9b);
 }
 if(caster){
  p(hx-2,hy,12,2,0x7866ab);
  p(hx+1,hy-3,6,3,0x594b87);
  p(bx+2,by+8,8,2,0x9080bc);
 }
 if(court){p(bx,by,12,2,0x9a6b70);p(bx+4,by+5,4,2,0xb46b6e);}
 if(heroId==='iria'){p(hx-3,hy+3,3,6,0x343447);p(hx+8,hy+3,3,6,0x343447);}
 if(heroId==='silas'){p(bx-2,by,4,5,0x8b8b89);p(bx+10,by,4,5,0x8b8b89);}
 if(heroId==='dara'){p(hx,hy-1,8,2,0x84a9b4);p(bx+4,by+5,4,4,0xb8d9de);}
 if(heroId==='lorena'){p(bx-1,by,4,7,0xaab6be);p(bx+9,by,4,7,0xaab6be);}
 if(guard){p(bx+3,by+2,6,3,0xc4c8ca);}
 if(hurt){p(bx+4,by+5,4,2,0xc98087);}
 if(down){p(bx+3,by+8,6,2,0x4b3539);}
}
function createSheet(meta,faceRight){
 const canvas=document.createElement('canvas');
 canvas.width=WIDTH*TILE*POSES.length;
 canvas.height=HEIGHT*TILE;
 const ctx=canvas.getContext('2d',{alpha:true});
 if(!ctx)throw Error('Pixel sprite canvas 2D indisponível');
 ctx.imageSmoothingEnabled=false;
 POSES.forEach((pose,i)=>drawPose(ctx,pose,meta,faceRight,i*WIDTH));
 return canvas;
}
function atlasKey(unit,meta,faceRight){
 const token=String(unit.id||unit.name||'personagem').replace(/[^a-z0-9_-]/gi,'_').slice(0,42);
 return ['carcaca-frame-v21',token,unit.side,faceRight?'r':'l',
  meta.coat.toString(16),meta.shadow.toString(16)].join('-');
}
function createFighter(scene,unit,faceRight,meta){
 if(typeof document==='undefined'||!scene?.textures?.addSpriteSheet||!scene?.add?.sprite)return null;
 try{
  const key=atlasKey(unit,meta,faceRight);
  if(!scene.textures.exists(key)){
   scene.textures.addSpriteSheet(key,createSheet(meta,faceRight),
    {frameWidth:WIDTH*TILE,frameHeight:HEIGHT*TILE});
   metrics.atlases++;
  }
  const sprite=scene.add.sprite(0,0,key,index.idle).setOrigin(.5,1);
  metrics.actors++;
  let current='idle';
  return {
   sprite,
   pose(name){
    const target=Object.hasOwn(index,name)?name:'idle';
    if(sprite.active&&current!==target){current=target;sprite.setFrame(index[target]);metrics.changes++;}
   }
  };
 }catch(error){
  console.warn('Carcaça sprite frames indisponíveis; fallback geométrico:',error);
  return null;
 }
}
root.RevoltPixelFrames={
 createFighter,poses:POSES.slice(),
 stats:()=>({...metrics})
};
})(window);
