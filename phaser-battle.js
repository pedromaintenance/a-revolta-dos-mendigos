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
  const W=420,H=650;
  root.textContent='';
  
  class Battle extends Phaser.Scene{
   constructor(){super({key:'battle'});}
   create(){
    const state=window.RevoltBattleBridge.snapshot();
    if(!state)return;
    const g=this.add.graphics();
    g.fillGradientStyle(0x182534,0x182534,0x282c36,0x282c36).fillRect(0,0,W,H);
    g.fillStyle(0x202d39).fillRect(0,60,W,182);
    for(let i=0;i<12;i++){
     const x=i*40-8,y=100+(i%3)*13;
     g.fillStyle(i%2?0x39404b:0x333c49).fillRect(x,y,32,148);
     g.fillStyle(0x101923).fillRect(x+10,y+22,12,18);
    }
    g.fillStyle(0x443f3d).fillRect(0,258,W,392);
    for(let y=266;y<H;y+=20){g.lineStyle(1,0x5d5147,.65).lineBetween(0,y,W,y);}
    g.lineStyle(2,0x97735b,.7).strokeRect(8,8,W-16,H-16);
    this.add.text(W/2,22,'✦ '+state.district+' ✦',{fontFamily:'Georgia',fontSize:'18px',color:'#ebca90'}).setOrigin(.5);
    this.add.text(W/2,52,'DIA '+state.day+' · RODADA '+state.round,{fontFamily:'monospace',fontSize:'11px',color:'#d6bfa9'}).setOrigin(.5);
    this.add.text(103,83,'RESISTÊNCIA',{fontFamily:'monospace',fontSize:'11px',color:'#98cbb7'}).setOrigin(.5);
    this.add.text(319,83,'CORTE',{fontFamily:'monospace',fontSize:'11px',color:'#d59c9a'}).setOrigin(.5);
    const selection=state.selected,acted=state.acted||[];
    const draw=(units,enemy)=>{
     const gap=Math.min(82,295/Math.max(units.length,1));
     units.forEach((u,i)=>{
      const x=enemy?313:104,y=143+i*gap;
      const live=u.hp>0,selected=selection===(enemy?'e':'h')+u.id;
      const ctr=this.add.container(x,y);
      const shadow=this.add.ellipse(0,27,65,14,0x0c1119,.45);
      const body=this.add.rectangle(0,-3,43,51,live?(enemy?0x7d5363:0x678f83):0x424650);
      body.setStrokeStyle(selected?4:2,selected?0xffd987:0x191e2a);
      const face=this.add.rectangle(0,-38,27,24,live?0xd3b89b:0x777778);
      const eye=this.add.rectangle(0,-39,15,3,0x20232a);
      const bar=this.add.rectangle(0,37,75,9,0x472e35);
      const hp=this.add.rectangle(-37.5,37,75*Math.max(0,Math.min(1,u.hp/Math.max(1,u.maxhp))),9,enemy?0xd36e77:0x8ccaab).setOrigin(0,.5);
      const label=this.add.text(0,49,(u.name||'').length>23?u.name.slice(0,22)+'…':u.name,{fontFamily:'monospace',fontSize:'10px',color:live?'#f0e4d3':'#aaa7a7'}).setOrigin(.5);
      const count=this.add.text(0,64,u.hp+'/'+u.maxhp+' PV'+(!enemy?' · '+u.mp+' F':''),{fontFamily:'monospace',fontSize:'10px',color:'#e7d6ba'}).setOrigin(.5);
      ctr.add([shadow,body,face,eye,bar,hp,label,count]);
      if(!enemy&&acted.includes(u.id)){const dot=this.add.text(25,-57,'✓',{fontFamily:'monospace',fontSize:'17px',color:'#e5c37c'});ctr.add(dot);}
      if(u.guard){const shield=this.add.text(-32,-57,'⬡',{fontFamily:'monospace',fontSize:'17px',color:'#acc9f6'});ctr.add(shield);}
      if(enemy&&u.ward){ctr.add(this.add.text(0,-66,'✧ SELO FEÉRICO',{fontFamily:'monospace',fontSize:'9px',color:'#d8afff'}).setOrigin(.5));}
      const hot=this.add.zone(x,y,94,Math.min(80,gap)).setInteractive({useHandCursor:true});
      hot.on('pointerdown',()=>{if(!live)return;window.RevoltBattleBridge.command((enemy?'targetE:':'selectHero:')+u.id)});
      if(live&&selected)this.tweens.add({targets:ctr,y:y-5,duration:360,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
     });
    };
    draw(state.heroes,false);draw(state.enemies,true);
    const prompt=state.targetMode==='ataque'||state.targetMode==='skillEnemy'?'SELECIONE UM INIMIGO':state.targetMode==='heal'||state.targetMode==='potionAlly'?'SELECIONE UM ALIADO':'TOQUE EM UM COMBATENTE PARA SELECIONAR';
    this.add.text(W/2,441,prompt,{fontFamily:'monospace',fontSize:'12px',color:'#efc783'}).setOrigin(.5);
    const selected=state.selected?.startsWith('h')?state.heroes.find(h=>'h'+h.id===state.selected):null;
    const canAct=selected&&selected.hp>0&&!acted.includes(selected.id);
    const waiting=state.heroes.some(h=>h.hp>0&&!acted.includes(h.id));
    const aiming=!!state.targetMode;
    const control=(x,y,w,label,action,enabled=true,accent=false)=>{
      const bg=this.add.rectangle(x,y,w,38,enabled?(accent?0x755339:0x344a50):0x2a3036).setStrokeStyle(2,enabled?0xc4a477:0x565a60);
      this.add.text(x,y,label,{fontFamily:'monospace',fontSize:'13px',color:enabled?'#f8e6c4':'#888b8d'}).setOrigin(.5);
      if(enabled)bg.setInteractive({useHandCursor:true}).on('pointerdown',()=>window.RevoltBattleBridge.command(action));
    };
    if(aiming){
      control(210,491,348,'✕ CANCELAR ALVO','cancelTarget',true);
    }else{
      control(109,481,194,'⚔ ATACAR','attack',!!canAct,true);
      control(311,481,194,'✦ HABILIDADE (8)','skill',!!canAct&&selected.mp>=8);
      control(109,530,194,'✚ CURATIVO ('+state.herbs+')','potion',!!canAct&&state.herbs>0);
      control(311,530,194,'⬡ DEFENDER','defend',!!canAct);
    }
    control(210,592,390,'ENCERRAR RODADA · VEZ DA CORTE','enemyTurn',!waiting);
    this.add.text(W/2,626,'AUXÍLIOS SOBRENATURAIS E REGISTRO ABAIXO',{fontFamily:'monospace',fontSize:'10px',color:'#c8b294'}).setOrigin(.5);
    this.game.events.once('postrender',()=>{
      if(my!==token||!root.isConnected)return;
      const canvas=this.game.canvas;
      if(canvas&&canvas.isConnected&&canvas.width>0&&canvas.height>0){
       root.classList.remove('phaser-loading');
       root.classList.add('phaser-ready');
      }
    });
   }
  }
  try{game=new Phaser.Game({type:Phaser.CANVAS,parent:root,width:W,height:H,transparent:false,backgroundColor:'#16202e',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_HORIZONTALLY},render:{pixelArt:true,antialias:false},scene:[Battle]});}catch(e){root.classList.remove('phaser-ready','phaser-loading');root.textContent='Erro no Phaser; controles clássicos disponíveis.';game=null;console.error('Phaser combat fallback:',e)}
 });
}
window.PhaserBattle={mount,destroy,refresh};
})();
