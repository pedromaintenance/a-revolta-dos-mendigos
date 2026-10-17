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
  const fatal=kind==='attack'&&d.hp>0&&dAfter.hp<=0;
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
  text(210,95,kind==='heal'?'✚ CURA ✚':kind==='guard'?'⬡ PROTEÇÃO ⬡':fatal?'✦ GOLPE FINAL ✦':'✦ CONFRONTO ✦',16,fatal?'#f19c8c':'#f5cc8c');
  if(options.sequenceTotal>1)text(210,118,'EVENTO '+options.sequencePosition+' / '+options.sequenceTotal,10,'#b4d9da');
  rect(210,360,396,35,0x26343d);
  const eventTitle=text(210,359,'PREPARANDO O GOLPE',11,'#e9d0a2');
  const allyLeft=a.side==='ally',xAtt=allyLeft?113:305,xDef=allyLeft?307:111,yChar=244;
  // Local procedural pixel sprites: 20x30 pixels ×4. No remote character images.
  function makeFighter(u,x,faceRight){
    const c=add(scene.add.container(x,yChar));
    const id=String(u.id||'').toLowerCase(),name=String(u.name||'').toLowerCase();
    // Distinct visual identities for the eight canonical heroes.
    const heroId=['coto','marga','iria','silas','olmo','dara','vega','lorena'].find(key=>id.includes(key));
    const heroPalette={
      coto:{coat:0x587e71,shadow:0x354e48,detail:0xd2b77b,hair:0x6b503b,weapon:'sword'},
      marga:{coat:0x7b7254,shadow:0x504a3b,detail:0xc6a77d,hair:0x8e6c52,weapon:'staff'},
      iria:{coat:0x514d67,shadow:0x343446,detail:0xb4a1be,hair:0x252735,weapon:'dagger'},
      silas:{coat:0x74716a,shadow:0x444440,detail:0xc7a46c,hair:0x49372f,weapon:'hammer'},
      olmo:{coat:0x668077,shadow:0x42584f,detail:0xa9d1bb,hair:0xb0a188,weapon:'staff'},
      dara:{coat:0x527d8a,shadow:0x365463,detail:0xadc7c6,hair:0x362e3d,weapon:'spear'},
      vega:{coat:0x835462,shadow:0x563945,detail:0xe4a185,hair:0x362d33,weapon:'staff'},
      lorena:{coat:0x778b97,shadow:0x485b66,detail:0xd3bfa2,hair:0x9d8f74,weapon:'shield'}
    };
    const profile=heroId?heroPalette[heroId]:null;
    const court=u.side==='enemy';
    const healer=/marga|olmo|curand|bardo|sacerdot/.test(id+' '+name);
    const knight=/lorena|cavaleir|inquisidor|guarda|lanceir|paladino/.test(id+' '+name);
    const caster=/vega|bruxa|feiticeir|arauto/.test(id+' '+name);
    const color=profile?profile.coat:court?0x884e61:healer?0x657f6b:caster?0x665a90:knight?0x718790:0x567b75;
    const shade=profile?profile.shadow:court?0x573343:healer?0x394f44:caster?0x423b64:knight?0x415560:0x314b48;
    const trim=profile?profile.detail:court?0xd4a39d:healer?0xd8c489:caster?0xb8a6de:0xc6b78e;
    const sprite=scene.add.graphics();
    // All coordinates lie on a 4px grid to keep the pixel silhouette crisp.
    const p=(px,py,w,h,fill)=>{sprite.fillStyle(fill,1);sprite.fillRect((px-10)*4,(py-27)*4,w*4,h*4);};
    p(4,26,12,2,0x17222a);          // contact shadow
    p(5,21,4,6,0x303b42);p(11,21,4,6,0x303b42);
    p(4,24,5,2,0x252c35);p(11,24,5,2,0x252c35);
    p(4,11,12,12,shade);            // cloak silhouette
    p(5,12,10,10,color);
    p(7,15,6,5,trim);               // tunic plate
    p(5,20,10,2,shade);p(9,19,2,3,0x4a3637); // belt
    p(3,12,3,9,shade);p(14,12,3,9,shade); // arms
    p(3,19,3,2,0xd4ad8f);p(14,19,3,2,0xd4ad8f);
    p(6,4,8,9,0xe0b796);           // face
    p(5,3,10,4,court?0x45404c:0x503a36);
    p(6,2,8,2,profile?profile.hair:court?0x626675:0x705046);
    p(faceRight?12:7,9,2,1,0x242c35); // visible eye
    p(8,12,4,2,shade);             // collar
    if(knight){p(5,3,10,3,0x6e8290);p(4,5,2,7,0x8797a0);p(14,5,2,7,0x8797a0);p(7,15,6,3,0xb2b5b6);}
    if(healer){p(4,4,12,3,0xd1be82);p(8,15,4,1,0xf4df9b);p(9,13,2,5,0xf4df9b);}
    if(caster){p(4,4,12,2,0x7866ab);p(7,1,6,3,0x594b87);p(6,18,8,2,0x9080bc);}
    if(court){p(4,11,12,2,0x9a6b70);p(8,16,4,2,0xb46b6e);}
    if(heroId==='iria'){p(3,7,3,6,0x343447);p(14,7,3,6,0x343447);}
    if(heroId==='silas'){p(2,11,4,5,0x8b8b89);p(14,11,4,5,0x8b8b89);}
    if(heroId==='dara'){p(6,3,8,2,0x84a9b4);p(8,16,4,4,0xb8d9de);}
    if(heroId==='lorena'){p(3,11,4,8,0xaab6be);p(13,11,4,8,0xaab6be);}
    c.add(sprite);
    const weaponType=profile?.weapon||(healer||caster?'staff':'sword');
    const staff=weaponType==='staff';
    const equipped=staff?0xc9a477:0xe2d6bf;
    // The weapon rotates around the hand, with a distinct hilt/edge silhouette.
    const pivot=faceRight?37:-37;
    const weapon=scene.add.container(pivot,-16);
    const shaft=scene.add.rectangle(0,-30,staff?9:8,staff?85:89,equipped);
    const grip=scene.add.rectangle(0,9,13,17,0x473b3a);
    weapon.add([shaft,grip]);
    if(!staff){
      weapon.add(scene.add.rectangle(0,-3,34,7,0xb3a4a1));
      if(weaponType==='hammer')weapon.add(scene.add.rectangle(0,-79,40,22,0x888989));
      else if(weaponType==='spear')weapon.add(scene.add.triangle(0,-86,-9,16,9,16,0,-8,0xd9ddd6));
      else if(weaponType==='dagger')weapon.add(scene.add.triangle(0,-72,-5,9,5,9,0,-8,0xc6c8d5));
      else weapon.add(scene.add.triangle(0,-79,-5,9,5,9,0,0,0xf7edda));
    }else{
      weapon.add(scene.add.circle(0,-74,12,caster?0xb59cdb:0x8bcdaa));
    }
    c.add(weapon);
    if(weaponType==='shield')c.add(scene.add.polygon(faceRight?-31:31,-8,[-18,-18,18,-18,18,9,0,28,-18,9],0xa1acb4).setStrokeStyle(3,0xdbca9f));
    c.add(scene.add.ellipse(0,25,90,12,0x050c12,.35).setDepth(-1));
    return {c,weapon,weaponType};
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
  // Weapon-specific telegraphs: each archetype has a recognizable rhythm.
  const style=attacker.weaponType;
  const fast=style==='dagger',heavy=style==='hammer',pierce=style==='spear';
  const spell=style==='staff',shieldBash=style==='shield';
  const windup=fast?65:heavy?225:spell?170:130;
  const release=fast?225:heavy?465:spell?420:shieldBash?365:320;
  const impact=release+(fast?125:heavy?225:spell?195:175);
  const recovery=heavy?440:fast?180:285;
  delay(windup,()=>{
    eventTitle.setText(spell?a.name+' CONJURA!':heavy?a.name+' ERGUE O MARTELO':pierce?a.name+' ARMA A LANÇA':fast?a.name+' AVANÇA NAS SOMBRAS':shieldBash?a.name+' INVESTE!':a.name+' PREPARA O GOLPE');
    scene.tweens.add({targets:attacker.weapon,angle:spell?0:heavy?(allyLeft?-110:110):pierce?(allyLeft?-22:22):(allyLeft?-62:62),duration:heavy?230:130,ease:'Sine.easeOut'});
    scene.tweens.add({targets:attacker.c,y:yChar-(heavy?15:7),duration:140,yoyo:true});
    if(spell){
      const charge=add(scene.add.circle(xAtt,yChar-86,12,0xb9a0f0,.38));
      scene.tweens.add({targets:charge,scale:2.3,alpha:0,duration:470,onComplete:()=>charge.destroy()});
    }
  });
  delay(release,()=>{
    eventTitle.setText(spell?'MAGIA DESENCADEADA!':heavy?'IMPACTO ESMAGADOR!':pierce?'ESTOCADA!':fast?'GOLPE RÁPIDO!':shieldBash?'GOLPE DE ESCUDO!':a.name+' ATACA!');
    scene.tweens.add({targets:attacker.c,x:xAtt+(allyLeft?(pierce?82:fast?88:65):-(pierce?82:fast?88:65)),duration:fast?95:heavy?235:175,yoyo:true,hold:heavy?145:70,ease:heavy?'Quad.easeIn':'Quad.easeOut'});
    scene.tweens.add({targets:attacker.weapon,angle:spell?0:heavy?(allyLeft?115:-115):pierce?(allyLeft?28:-28):(allyLeft?78:-78),duration:heavy?235:fast?90:150,ease:'Cubic.easeIn',onComplete:()=>{
      if(finished)return;
      scene.tweens.add({targets:attacker.weapon,angle:allyLeft?10:-10,duration:recovery});
    }});
    if(fast)scene.tweens.add({targets:attacker.c,alpha:.42,duration:70,yoyo:true,repeat:1});
  });
  delay(impact,()=>{
    slash(xDef,241,spell?0xc4a5ff:heavy?0xffa577:pierce?0xb4d6db:fast?0xf6d9e7:0xffd598);
    scene.cameras.main.shake(heavy?195:105,heavy?.008:.004);
    scene.tweens.add({targets:flash,alpha:heavy?.7:.5,duration:heavy?100:60,yoyo:true});
    scene.tweens.add({targets:defender.c,x:xDef+(allyLeft?14:-14),duration:90,yoyo:true});
    updateBar(dFill,dVal,xDef,dAfter.hp,d.maxhp,lost);
    eventTitle.setText('−'+lost+' PV · '+d.name);
    if(fatal){
      delay(190,()=>{
        eventTitle.setText(d.name+' FOI DERROTADO');
        const burst=add(scene.add.star(xDef,239,8,24,78,0xc95c62,.42));
        const crest=text(xDef,214,'✕',47,'#ffd6bf');
        scene.tweens.add({targets:burst,scale:2.2,alpha:0,duration:570,onComplete:()=>burst.destroy()});
        scene.tweens.add({targets:crest,y:170,alpha:0,duration:650,onComplete:()=>crest.destroy()});
        scene.tweens.add({targets:defender.c,alpha:0,y:yChar+28,scale:.8,duration:560,ease:'Quad.easeIn'});
      });
    }
  });
  let endTime=1150;
  if(counter>0&&dAfter.hp>0){
    delay(impact+645,()=>{
      eventTitle.setText('CONTRA-ATAQUE!');
      scene.tweens.add({targets:defender.weapon,angle:allyLeft?62:-62,duration:120,yoyo:true});
      scene.tweens.add({targets:defender.c,x:xDef+(allyLeft?-60:60),duration:175,yoyo:true,hold:75});
    });
    delay(impact+865,()=>{
      slash(xAtt,241,0xd9a7f7);
      scene.cameras.main.shake(100,.003);
      updateBar(aFill,aVal,xAtt,aAfter.hp,a.maxhp,counter);
      eventTitle.setText('−'+counter+' PV · '+a.name);
      if(aAfter.hp<=0)scene.tweens.add({targets:attacker.c,alpha:.25,duration:330});
    });
    endTime=impact+1735;
  }else endTime=impact+(fatal?1395:1035);
  delay(endTime,finish);
}
root.RevoltBattlePopup={play};
})(window);
