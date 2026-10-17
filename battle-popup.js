/* Carcaça — cinematic combat presentation. HP is resolved by the canonical rules engine. */
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
  const kind=options.kind||'attack';
  const lost=Math.max(0,d.hp-dAfter.hp),counter=Math.max(0,a.hp-aAfter.hp);
  const viewportHeight=scene.scale.height;
  const blocker=scene.add.zone(W/2,viewportHeight/2,W,viewportHeight).setDepth(1999).setInteractive();
  const rootLayer=scene.add.container(0,0).setDepth(2000);
  let finished=false;
  const jobs=[];
  const delay=(ms,fn)=>jobs.push(scene.time.delayedCall(ms,()=>{if(!finished)fn();}));
  const add=(object)=>{rootLayer.add(object);return object;};
  const rect=(x,y,w,h,color,alpha=1)=>add(scene.add.rectangle(x,y,w,h,color,alpha));
  const text=(x,y,s,sz=12,color='#f7e6c7')=>add(scene.add.text(x,y,s,{fontFamily:'monospace',fontSize:String(sz)+'px',color,fontStyle:'bold',align:'center',stroke:'#18212c',strokeThickness:1}).setOrigin(.5));
  const finish=()=>{if(finished)return;finished=true;jobs.forEach(j=>j.remove(false));rootLayer.destroy(true);blocker.destroy();options.onDone();};
  rect(210,viewportHeight/2,W,viewportHeight,0x080b12,.9);
  rect(210,229,406,310,0x101d2a).setStrokeStyle(3,0xd1a56c);
  rect(210,95,396,34,0x25303b);
  text(210,95,kind==='heal'?'✚ CURA ✚':kind==='guard'?'⬡ PROTEÇÃO ⬡':'✦ CONFRONTO ✦',16,'#f5cc8c');
  if(options.sequenceTotal>1)text(210,118,'EVENTO '+options.sequencePosition+' / '+options.sequenceTotal,10,'#b4d9da');
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
  const hasQueue=options.sequenceTotal>1&&typeof options.onSkipAll==='function';
  const skip=rect(hasQueue?275:335,390,hasQueue?112:128,29,0x354e57).setStrokeStyle(1,0xc8ae83);
  text(hasQueue?275:335,390,hasQueue?'PRÓXIMO ›':'PULAR ››',11);
  skip.setInteractive({useHandCursor:true}).on('pointerdown',finish);
  if(hasQueue){
    const all=rect(91,390,148,29,0x5b3e43).setStrokeStyle(1,0xd6a88c);
    text(91,390,'PULAR TUDO »',10);
    all.setInteractive({useHandCursor:true}).on('pointerdown',()=>{
      if(finished)return;
      finished=true;jobs.forEach(j=>j.remove(false));
      rootLayer.destroy(true);blocker.destroy();options.onSkipAll();
    });
  }
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
  if(kind==='heal'||kind==='guard'){
    const healed=Math.max(0,dAfter.hp-d.hp);
    delay(200,()=>{
      eventTitle.setText(kind==='heal'?a.name+' RESTAURA '+d.name:d.name+' ASSUME DEFESA!');
      scene.tweens.add({targets:defender.c,scale:1.08,duration:240,yoyo:true,ease:'Sine.easeInOut'});
    });
    delay(420,()=>{
      const color=kind==='heal'?0x72e5a7:0x89c2f8;
      const ring=add(scene.add.circle(xDef,236,29,color,.14).setStrokeStyle(4,color,.9));
      const symbol=text(xDef,213,kind==='heal'?'✚':'⬡',40,kind==='heal'?'#a5ffbf':'#bfdfff');
      scene.tweens.add({targets:ring,scale:2.5,alpha:0,duration:670,onComplete:()=>ring.destroy()});
      scene.tweens.add({targets:symbol,y:183,alpha:0,duration:700,onComplete:()=>symbol.destroy()});
      if(kind==='heal'){
        scene.tweens.add({targets:dFill,displayWidth:140*Math.max(0,dAfter.hp/dAfter.maxhp),duration:480});
        dVal.setText(dAfter.hp+' / '+dAfter.maxhp+' PV');
        eventTitle.setText(d.name+' RECUPERA +'+healed+' PV');
      }else eventTitle.setText(d.name+' ESTÁ PROTEGIDO');
    });
    delay(1550,finish);
    return;
  }
  // Telegraph the strike before lunging: the weapon lifts and swings, not only the body.
  delay(110,()=>{
    eventTitle.setText(a.name+' PREPARA O GOLPE');
    scene.tweens.add({targets:attacker.weapon,angle:allyLeft?-62:62,duration:160,ease:'Sine.easeOut'});
    scene.tweens.add({targets:attacker.c,y:yChar-7,duration:150,yoyo:true});
  });
  delay(320,()=>{
    eventTitle.setText(a.name+' ATACA!');
    scene.tweens.add({targets:attacker.c,x:xAtt+(allyLeft?65:-65),duration:180,yoyo:true,hold:100,ease:'Quad.easeOut'});
    scene.tweens.add({targets:attacker.weapon,angle:allyLeft?78:-78,duration:155,ease:'Cubic.easeIn',onComplete:()=>{
      scene.tweens.add({targets:attacker.weapon,angle:allyLeft?10:-10,duration:300});
    }});
  });
  delay(515,()=>{
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
    delay(1160,()=>{
      eventTitle.setText('CONTRA-ATAQUE!');
      scene.tweens.add({targets:defender.weapon,angle:allyLeft?62:-62,duration:120,yoyo:true});
      scene.tweens.add({targets:defender.c,x:xDef+(allyLeft?-60:60),duration:175,yoyo:true,hold:75});
    });
    delay(1380,()=>{
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
