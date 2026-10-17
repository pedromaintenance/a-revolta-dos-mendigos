/* Carcaça — animated combat cut-in. Pure presentation: damage comes from tactical-core.js. */
(function(root){
'use strict';
const W=420,H=460;
function play(scene,options){
  if(!scene||!scene.sys.isActive()){options.onDone();return;}
  const before=options.before,after=options.after;
  const a=before.units.find(u=>u.id===options.attackerId);
  const d=before.units.find(u=>u.id===options.defenderId);
  const dAfter=after.units.find(u=>u.id===options.defenderId);
  const aAfter=after.units.find(u=>u.id===options.attackerId);
  if(!a||!d||!dAfter||!aAfter){options.onDone();return;}
  const lost=Math.max(0,d.hp-dAfter.hp),counter=Math.max(0,a.hp-aAfter.hp);
  const rootLayer=scene.add.container(0,0).setDepth(2000);
  let finished=false;
  const jobs=[];
  const delay=(ms,fn)=>jobs.push(scene.time.delayedCall(ms,()=>{if(!finished)fn();}));
  const add=(object)=>{rootLayer.add(object);return object;};
  const rect=(x,y,w,h,color,alpha=1)=>add(scene.add.rectangle(x,y,w,h,color,alpha));
  const text=(x,y,s,sz=12,color='#f7e6c7')=>add(scene.add.text(x,y,s,{fontFamily:'monospace',fontSize:String(sz)+'px',color,fontStyle:'bold',align:'center',stroke:'#18212c',strokeThickness:1}).setOrigin(.5));
  const finish=()=>{if(finished)return;finished=true;jobs.forEach(j=>j.remove(false));rootLayer.destroy(true);options.onDone();};
  rect(210,230,W,H,0x080b12,.88);
  rect(210,229,406,310,0x101d2a).setStrokeStyle(3,0xd1a56c);
  rect(210,95,396,34,0x25303b);
  text(210,95,'✦ CONFRONTO ✦',16,'#f5cc8c');
  rect(210,360,396,35,0x26343d);
  const eventTitle=text(210,359,'PREPARANDO O GOLPE',11,'#e9d0a2');
  const allyLeft=a.side==='ally',xAtt=allyLeft?113:305,xDef=allyLeft?307:111,yChar=244;
  function makeFighter(u,x,faceRight){
    const c=add(scene.add.container(x,yChar));
    const side=u.side==='ally';
    const coat=side?0x628c7d:0x935c67;
    c.add([scene.add.ellipse(0,34,95,17,0x010911,.52),scene.add.rectangle(-14,16,20,38,0x26303b),scene.add.rectangle(14,16,20,38,0x26303b),scene.add.rectangle(0,-18,67,72,coat).setStrokeStyle(4,0x252430),scene.add.rectangle(0,-82,47,53,0xd5ac90),scene.add.rectangle(0,-109,52,13,side?0x674b38:0x525868)]);
    const eye=scene.add.rectangle(faceRight?11:-11,-84,10,5,0x28222b);c.add(eye);
    const weapon=scene.add.rectangle(faceRight?46:-46,-15,7,101,0xd4cbb3).setRotation(faceRight?.18:-.18);
    c.add(weapon);
    return {c,weapon};
  }
  const attacker=makeFighter(a,xAtt,allyLeft),defender=makeFighter(d,xDef,!allyLeft);
  const aName=text(xAtt,135,a.name,11,'#b9e4c9'),dName=text(xDef,135,d.name,11,'#efb7bc');
  const aVal=text(xAtt,159,a.hp+' / '+a.maxhp+' PV',11),dVal=text(xDef,159,d.hp+' / '+d.maxhp+' PV',11);
  const aBack=rect(xAtt,177,145,9,0x4c3037),dBack=rect(xDef,177,145,9,0x4c3037);
  let aFill=rect(xAtt-70,177,140*Math.max(0,a.hp/a.maxhp),7,0x86d7b1).setOrigin(0,.5);
  let dFill=rect(xDef-70,177,140*Math.max(0,d.hp/d.maxhp),7,0xd57b86).setOrigin(0,.5);
  const flash=rect(210,230,396,305,0xffffff,0);
  // Ensure all objects, including the weapon, are owned by the cut-in.
  const skip=rect(335,390,128,29,0x354e57).setStrokeStyle(1,0xc8ae83);
  const skipText=text(335,390,'PULAR ››',11);
  skip.setInteractive({useHandCursor:true}).on('pointerdown',finish);
  const slash=(x,y,color)=>{
    const line=add(scene.add.rectangle(x,y,95,7,color).setRotation(-.7));
    const spark=add(scene.add.star(x,y,4,12,32,0xffe9ba,.9));
    scene.tweens.add({targets:[line,spark],scaleX:1.5,alpha:0,duration:280,onComplete:()=>{line.destroy();spark.destroy();}});
  };
  function updateBar(fill,label,x,now,max,damage){
    scene.tweens.add({targets:fill,displayWidth:140*Math.max(0,now/max),duration:370});
    label.setText(now+' / '+max+' PV');
    const floater=text(x,208,'−'+damage,23,'#ff8588');
    scene.tweens.add({targets:floater,y:181,alpha:0,duration:700,onComplete:()=>floater.destroy()});
  }
  delay(220,()=>{eventTitle.setText(a.name+' ATACA!');scene.tweens.add({targets:attacker.c,x:xAtt+(allyLeft?65:-65),duration:160,yoyo:true,hold:90,ease:'Sine.easeOut'});});
  delay(400,()=>{
    slash(xDef,241,0xffd598);
    scene.cameras.main.shake(105,.004);
    scene.tweens.add({targets:flash,alpha:.5,duration:60,yoyo:true});
    scene.tweens.add({targets:defender.c,x:xDef+(allyLeft?14:-14),duration:90,yoyo:true});
    updateBar(dFill,dVal,xDef,dAfter.hp,d.maxhp,lost);
    eventTitle.setText('−'+lost+' PV · '+d.name);
    if(dAfter.hp<=0)scene.tweens.add({targets:defender.c,alpha:.28,duration:400,delay:270});
  });
  let endTime=1150;
  if(counter>0&&dAfter.hp>0){
    delay(1100,()=>{eventTitle.setText('CONTRA-ATAQUE!');scene.tweens.add({targets:defender.c,x:xDef+(allyLeft?-60:60),duration:155,yoyo:true,hold:75});});
    delay(1310,()=>{
      slash(xAtt,241,0xd9a7f7);
      scene.cameras.main.shake(100,.003);
      updateBar(aFill,aVal,xAtt,aAfter.hp,a.maxhp,counter);
      eventTitle.setText('−'+counter+' PV · '+a.name);
      if(aAfter.hp<=0)scene.tweens.add({targets:attacker.c,alpha:.25,duration:330});
    });
    endTime=2200;
  }else endTime=1550;
  delay(endTime,finish);
}
root.RevoltBattlePopup={play};
})(window);
