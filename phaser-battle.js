/* Phaser combat viewport — the original app.js remains the sole rules engine. */
(function(){
'use strict';
let game=null,token=0,loading=null,lastSnapshot=null;
const KENNEY='https://raw.githubusercontent.com/Two-Weeks-Team/openClawWorld/main/packages/client/public/assets/kenney/characters/characters_spritesheet.png';
const SCRIPT='https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js';
function engine(){if(window.Phaser)return Promise.resolve(true);if(loading)return loading;loading=new Promise(resolve=>{const s=document.createElement('script');s.src=SCRIPT;s.onload=()=>resolve(!!window.Phaser);s.onerror=()=>resolve(false);document.head.append(s)});return loading}
function destroy(){token++;lastSnapshot=null;if(game){try{game.destroy(true)}catch(e){console.warn(e)}game=null}}
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
   preload(){if(!this.textures.exists('kenney'))this.load.image('kenney',KENNEY);}
   create(){
    const state=window.RevoltBattleBridge.snapshot();
    if(!state)return;
    const previous=lastSnapshot?.day===state.day?lastSnapshot:null;
    lastSnapshot=JSON.parse(JSON.stringify(state));
    const spriteReady=this.textures.exists('kenney');
    const unitsByKey=new Map();
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
    function figure(scene,u,enemy,x,y,selected,scale=1){
      const c=scene.add.container(x,y);c.setDepth(10);c.setScale(scale);
      const shadow=scene.add.ellipse(0,6,65,12,0x02080e,.57);
      c.add(shadow);
      let actor;
      if(spriteReady){
        // Kenney's sheet contains front-facing, layered 16px sprites.
        // Use base characters from first columns; preserve original colors.
        const heroRows={coto:4,marga:9,iria:8,silas:5,olmo:7,dara:10,vega:11,lorena:3};
        const foeRows={guarda:2,arqueiro:3,carcereiro:5,sabujo:0,lancas:3,espectro:11,carniceiro:5,bruxa:9,cavaleiro:5,ulorian:11};
        const row=enemy?(foeRows[u.key]??((Number(u.id)||0)%9+1)):(heroRows[u.id]??4);
        const col=enemy?1:0;
        const frame='kenney-'+col+'-'+row;
        if(!scene.textures.get('kenney').has(frame))scene.textures.get('kenney').add(frame,0,col*17,row*17,16,16);
        actor=scene.add.image(0,-44,'kenney',frame).setScale(4.3).setOrigin(.5,.8);
        actor.setTexture('kenney',frame);
        if(enemy)actor.setFlipX(true);
        c.add(actor);
      }else{
        // Temporary fallback if the third-party asset cannot load.
        actor=scene.add.rectangle(0,-41,43,66,enemy?0x795165:0x587f72).setStrokeStyle(3,0x231e25);
        c.add([actor,scene.add.circle(0,-81,17,0xd5b99c)]);
      }
      if(u.hp<=0)c.setAlpha(.35);
      if(selected){
        const marker=scene.add.ellipse(0,9,77,17).setStrokeStyle(3,0xe6bd69);
        c.add(marker);
        scene.tweens.add({targets:marker,alpha:.4,duration:470,yoyo:true,repeat:-1});
      }
      if(u.guard)c.add(scene.add.text(-42,-95,'⬡',{fontFamily:'monospace',fontSize:'18px',color:'#dae8ff'}));
      if(!enemy&&acted.includes(u.id))c.add(scene.add.text(29,-96,'✓',{fontFamily:'monospace',fontSize:'18px',color:'#f3cb80'}));
      if(u.ward)c.add(scene.add.text(0,-109,'✧ SELO',{fontFamily:'monospace',fontSize:'10px',color:'#f2c4ff'}).setOrigin(.5));
      const max=Math.max(1,u.maxhp);
      const bg=scene.add.rectangle(0,22,106,9,0x332932).setStrokeStyle(1,0x9b8474);
      const hp=scene.add.rectangle(-52,22,104*Math.max(0,Math.min(1,u.hp/max)),7,enemy?0xc76e7b:0x88caaa).setOrigin(0,.5);
      const label=scene.add.text(0,36,u.name.length>22?u.name.slice(0,21)+'…':u.name,{fontFamily:'monospace',fontSize:'11px',color:'#f8e9d7',backgroundColor:'#19232c',align:'center'}).setOrigin(.5);
      const stats=scene.add.text(0,51,u.hp+'/'+u.maxhp+' PV'+(enemy?'':'  '+u.mp+' F'),{fontFamily:'monospace',fontSize:'10px',color:'#ebd0a9'}).setOrigin(.5);
      c.add([bg,hp,label,stats]);
      const key=(enemy?'e':'h')+u.id;
      unitsByKey.set(key,{c,actor,x,y});
      const hit=scene.add.zone(x,y-35*scale,138,Math.min(100,110*scale)).setDepth(20).setInteractive({useHandCursor:true});
      hit.on('pointerdown',()=>{if(u.hp<=0)return;window.RevoltBattleBridge.command((enemy?'targetE:':'selectHero:')+u.id)});
      scene.tweens.add({targets:c,y:y-2.5*scale,duration:900+((Number(u.id)||0)*117)%400,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }
    // Two clearly separated columns, max four fighters each, no overlapping labels.
    const draw=(units,enemy)=>{
      const n=units.length;
      const ys=n<=2?(n===1?[235]:[184,306]):n===3?[161,250,339]:[140,211,282,351];
      const scale=n>=4?.67:n===3?.78:n===2?.9:1;
      units.forEach((u,i)=>figure(this,u,enemy,enemy?316:104,ys[i]||216,state.selected===(enemy?'e':'h')+u.id,scale));
    };
    draw(state.heroes,false);draw(state.enemies,true);
    // Transitions are derived from canonical HP changes, never from guessed damage.
    if(previous){
      const before=new Map([...previous.heroes.map(u=>['h'+u.id,u]),...previous.enemies.map(u=>['e'+u.id,u])]);
      for(const current of [...state.heroes.map(u=>({...u,_key:'h'+u.id})),...state.enemies.map(u=>({...u,_key:'e'+u.id}))]){
        const old=before.get(current._key),entry=unitsByKey.get(current._key);
        if(!old||!entry||old.hp===current.hp)continue;
        const delta=current.hp-old.hp,positive=delta>0;
        const float=this.add.text(entry.x,entry.y-95,positive?'+'+delta:String(delta),{
          fontFamily:'monospace',fontSize:'21px',fontStyle:'bold',color:positive?'#9deac0':'#ff858b',
          stroke:'#101820',strokeThickness:4
        }).setOrigin(.5).setDepth(90);
        this.tweens.add({targets:float,y:float.y-46,alpha:0,duration:900,ease:'Cubic.easeOut',onComplete:()=>float.destroy()});
        if(!positive){
          this.cameras.main.shake(110,.002);
          this.tweens.add({targets:entry.actor,alpha:.2,duration:65,yoyo:true,repeat:2});
          this.tweens.add({targets:entry.c,x:entry.x+(current._key[0]==='e'?-10:10),duration:95,yoyo:true});
        }else{
          const ring=this.add.circle(entry.x,entry.y-43,16,0x8be5af,.36).setDepth(8);
          this.tweens.add({targets:ring,scale:3,alpha:0,duration:420,onComplete:()=>ring.destroy()});
        }
      }
    }
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
