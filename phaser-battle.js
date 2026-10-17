/* Phaser combat viewport — the original app.js remains the sole rules engine. */
(function(){
'use strict';
let game=null,token=0,loading=null;
const SCRIPT='https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js';
function engine(){if(window.Phaser)return Promise.resolve(true);if(loading)return loading;loading=new Promise(resolve=>{const s=document.createElement('script');s.src=SCRIPT;s.onload=()=>resolve(!!window.Phaser);s.onerror=()=>resolve(false);document.head.append(s)});return loading}
function destroy(){token++;if(game){try{game.destroy(true)}catch(e){console.warn(e)}game=null}}
function refresh(){
 if(!game||!game.scene)return;
 try{const scene=game.scene.getScene('battle');if(scene&&scene.sys.isActive())scene.scene.restart();}catch(e){console.error('Falha ao atualizar cena Phaser:',e)}
}
function mount(){
 const host=document.getElementById('phaser-battle');if(!host||!window.RevoltBattleBridge)return;
 const my=++token;
 host.classList.add('phaser-loading');
 host.textContent='Iniciando campo de batalha…';
 engine().then(ok=>{
  if(my!==token||!document.getElementById('phaser-battle'))return;
  if(!ok){host.textContent='Phaser indisponível; utilize os controles clássicos abaixo.';host.classList.remove('phaser-loading');console.warn('Phaser: falha ao carregar engine');return;}
  const root=document.getElementById('phaser-battle');
  const state=window.RevoltBattleBridge.snapshot();
  if(!state||!state.enemies||!state.heroes)return;
  const W=420,H=520;
  root.textContent='';
  class Battle extends Phaser.Scene{
   constructor(){super({key:'battle'});}
   create(){
    const state=window.RevoltBattleBridge.snapshot();
    if(!state)return;
    const g=this.add.graphics();
    // Compact, theatrical canal square; background stays visually behind the party.
    g.fillGradientStyle(0x101c2a,0x172333,0x28323b,0x28323b).fillRect(0,0,W,H);
    g.fillStyle(0x1f2d37).fillRect(0,55,W,207);
    for(let i=0;i<10;i++){
      const x=i*48-8,y=103+(i%3)*17;
      g.fillStyle(i%2?0x3c4851:0x303e49).fillRect(x,y,40,165);
      g.fillStyle(0x0c1926).fillRect(x+10,y+22,17,29);
      g.fillStyle(0x76635b).fillRect(x+9,y+20,19,3);
    }
    g.fillStyle(0x293b45).fillRect(0,245,W,45);
    g.fillStyle(0x3b4246).fillRect(0,290,W,76);
    for(let y=303;y<366;y+=19){g.lineStyle(1,0x65605a,.65).lineBetween(0,y,W,y);}
    g.lineStyle(2,0x947459,.8).strokeRect(7,7,W-14,359);
    g.lineStyle(1,0x806b57,.8).lineBetween(210,91,210,343);
    this.add.text(210,23,'✦ '+state.district+' ✦',{fontFamily:'Georgia',fontSize:'19px',color:'#efd09a'}).setOrigin(.5);
    this.add.text(210,50,'DIA '+state.day+'  ·  RODADA '+state.round,{fontFamily:'monospace',fontSize:'11px',color:'#d1bb9d'}).setOrigin(.5);
    this.add.text(103,78,'A RESISTÊNCIA',{fontFamily:'monospace',fontSize:'10px',color:'#98ceb0'}).setOrigin(.5);
    this.add.text(317,78,'A CORTE',{fontFamily:'monospace',fontSize:'10px',color:'#e1a6ac'}).setOrigin(.5);
    const acted=state.acted||[];
    function figure(scene,u,enemy,x,y,selected){
      const c=scene.add.container(x,y);
      const skin=enemy?0xd3b7a6:0xdcb99a,cloth=enemy?0x825464:(u.id==='coto'?0x598378:u.id==='marga'?0x937a56:u.id==='iria'?0x596e84:0x6b7f73);
      const dark=enemy?0x342735:0x283b3a;
      const pix=(px,py,w,h,color)=>scene.add.rectangle(px,py,w,h,color).setOrigin(0,0);
      const shadow=scene.add.ellipse(0,8,56,11,0x080e14,.55);
      const pieces=[shadow];
      // 8-bit-inspired fighter silhouette: boots, legs, tunic, arms, neck, face, hair / helmet.
      pieces.push(pix(-17,-13,13,22,dark),pix(5,-13,13,22,dark));
      pieces.push(pix(-25,-49,50,37,cloth));
      pieces.push(pix(-31,-43,8,29,dark),pix(23,-43,8,29,dark));
      pieces.push(pix(-10,-56,20,8,skin),pix(-16,-79,32,26,skin));
      pieces.push(pix(-18,-83,36,9,enemy?0x55515d:u.id==='marga'?0xa39a70:0x493b32));
      pieces.push(pix(enemy?-10:3,-68,7,3,0x211f25));
      if(enemy){pieces.push(pix(-22,-84,44,5,0x8c92a0),pix(26,-48,6,45,0xb4af9c));}
      else if(u.id==='coto'){pieces.push(pix(30,-44,5,55,0xc2c0a8),pix(24,-38,17,6,0x98794f));}
      else if(u.id==='marga'){pieces.push(pix(-35,-30,18,13,0xc1ad82),pix(-29,-34,6,5,0xe0d8bd));}
      else{pieces.push(pix(27,-44,5,34,0xaeb5ae));}
      if(!u.hp){const grey=scene.add.rectangle(0,-37,66,96,0x141820,.58);pieces.push(grey);}
      c.add(pieces);
      if(selected){const ring=scene.add.ellipse(0,12,71,16).setStrokeStyle(3,0xf4d388);c.add(ring);}
      const max=Math.max(1,u.maxhp);
      const hp=scene.add.rectangle(0,21,100,8,0x412c35);
      const fg=scene.add.rectangle(-50,21,100*Math.max(0,Math.min(1,u.hp/max)),8,enemy?0xd1767c:0x88c7a0).setOrigin(0,.5);
      const text=scene.add.text(0,34,u.name.length>22?u.name.slice(0,21)+'…':u.name,{fontFamily:'monospace',fontSize:'11px',color:'#f5e9d8',align:'center'}).setOrigin(.5);
      const stat=scene.add.text(0,47,u.hp+'/'+u.maxhp+' PV'+(enemy?'':' · '+u.mp+' F'),{fontFamily:'monospace',fontSize:'10px',color:'#e5d2b5'}).setOrigin(.5);
      c.add([hp,fg,text,stat]);
      if(u.guard)c.add(scene.add.text(-45,-93,'⬡',{fontFamily:'monospace',fontSize:'17px',color:'#d2e0ff'}));
      if(!enemy&&acted.includes(u.id))c.add(scene.add.text(32,-93,'✓',{fontFamily:'monospace',fontSize:'17px',color:'#f5cc76'}));
      if(u.ward)c.add(scene.add.text(0,-98,'✧ SELO',{fontFamily:'monospace',fontSize:'10px',color:'#e2baff'}).setOrigin(.5));
      const hit=scene.add.zone(x,y-20,145,142).setInteractive({useHandCursor:true});
      hit.on('pointerdown',()=>{if(u.hp<=0)return;window.RevoltBattleBridge.command((enemy?'targetE:':'selectHero:')+u.id)});
      if(selected){scene.tweens.add({targets:c,y:y-4,duration:450,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
    }
    // Two clearly separated columns, max four fighters each, no overlapping labels.
    const draw=(units,enemy)=>{
      const n=units.length;
      const ys=n<=2?(n===1?[204]:[176,290]):n===3?[149,246,343]:[138,216,294,365];
      units.forEach((u,i)=>figure(this,u,enemy,enemy?316:104,ys[i]||204,state.selected===(enemy?'e':'h')+u.id));
    };
    draw(state.heroes,false);draw(state.enemies,true);
    g.fillStyle(0x131f2a).fillRect(0,370,W,150);
    g.lineStyle(2,0x957659).lineBetween(0,370,W,370);
    const targetEnemy=state.targetMode==='ataque'||state.targetMode==='skillEnemy';
    const targetAlly=state.targetMode==='heal'||state.targetMode==='potionAlly';
    const hint=targetEnemy?'TOQUE EM UM INIMIGO':targetAlly?'TOQUE EM UM ALIADO':'SELECIONE UM COMBATENTE';
    this.add.text(W/2,386,hint,{fontFamily:'monospace',fontSize:'12px',color:'#ebc68c'}).setOrigin(.5);
    const selected=state.selected?.startsWith('h')?state.heroes.find(h=>'h'+h.id===state.selected):null;
    const canAct=!!selected&&selected.hp>0&&!acted.includes(selected.id);
    const waiting=state.heroes.some(h=>h.hp>0&&!acted.includes(h.id));
    const button=(x,y,w,label,command,enabled,accent=false)=>{
      const r=this.add.rectangle(x,y,w,34,enabled?(accent?0x725239:0x2d4951):0x27313b).setStrokeStyle(2,enabled?0xb89769:0x4e5861);
      this.add.text(x,y,label,{fontFamily:'monospace',fontSize:'11px',color:enabled?'#f6e7cb':'#8b9497'}).setOrigin(.5);
      if(enabled)r.setInteractive({useHandCursor:true}).on('pointerdown',()=>window.RevoltBattleBridge.command(command));
    };
    if(state.targetMode){button(210,424,385,'✕ CANCELAR ALVO','cancelTarget',true);}
    else{
      button(109,416,193,'⚔ ATACAR','attack',canAct,true);
      button(311,416,193,'✦ HABILIDADE','skill',canAct&&selected.mp>=8);
      button(109,454,193,'✚ CURATIVO ('+state.herbs+')','potion',canAct&&state.herbs>0);
      button(311,454,193,'⬡ DEFENDER','defend',canAct);
    }
    button(210,497,397,'ENCERRAR RODADA · VEZ DA CORTE','enemyTurn',!waiting);
    this.game.events.once('postrender',()=>{
      if(my!==token||!root.isConnected)return;
      const canvas=this.game.canvas;
      if(canvas&&canvas.isConnected&&canvas.width>0&&canvas.height>0){
        root.classList.remove('phaser-loading');root.classList.add('phaser-ready');
      }
    });
   }
  }
  try{game=new Phaser.Game({type:Phaser.CANVAS,parent:root,width:W,height:H,transparent:false,backgroundColor:'#16202e',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_HORIZONTALLY},render:{pixelArt:true,antialias:false},scene:[Battle]});}catch(e){root.classList.remove('phaser-ready','phaser-loading');root.textContent='Erro no Phaser; controles clássicos disponíveis.';game=null;console.error('Phaser combat fallback:',e)}
 });
}
window.PhaserBattle={mount,destroy,refresh};
})();
