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
  const W=420,H=560;
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
    const hasVisiblePixels=(col,row)=>{if(!spriteReady)return false;let count=0;for(let py=1;py<16;py+=2)for(let px=1;px<16;px+=2){if((this.textures.getPixelAlpha(col*17+px,row*17+py,'kenney')||0)>40)count++;}return count>=5;};
    const unitsByKey=new Map();
    const g=this.add.graphics().setDepth(-1000);
    // Compact, theatrical canal square; background stays visually behind the party.
    g.fillGradientStyle(0x101c2a,0x172333,0x28323b,0x28323b).fillRect(0,0,W,H);
    g.fillStyle(0x1f2d37).fillRect(0,55,W,275);
    for(let i=0;i<10;i++){
      const x=i*48-8,y=103+(i%3)*17;
      g.fillStyle(i%2?0x3c4851:0x303e49).fillRect(x,y,40,165);
      g.fillStyle(0x0c1926).fillRect(x+10,y+22,17,29);
      g.fillStyle(0x76635b).fillRect(x+9,y+20,19,3);
    }
    g.fillStyle(0x293b45).fillRect(0,295,W,45);
    g.fillStyle(0x3b4246).fillRect(0,340,W,68);
    for(let y=343;y<408;y+=19){g.lineStyle(1,0x65605a,.65).lineBetween(0,y,W,y);}
    g.lineStyle(2,0x947459,.8).strokeRect(7,7,W-14,400);
    g.lineStyle(1,0x806b57,.8).lineBetween(210,102,210,398);
    this.add.text(210,23,'✦ '+state.district+' ✦',{fontFamily:'Georgia',fontSize:'19px',color:'#efd09a'}).setOrigin(.5);
    this.add.text(210,50,'DIA '+state.day+'  ·  RODADA '+state.round,{fontFamily:'monospace',fontSize:'11px',color:'#d1bb9d'}).setOrigin(.5);
    this.add.text(317,78,'A RESISTÊNCIA',{fontFamily:'monospace',fontSize:'10px',color:'#98ceb0'}).setOrigin(.5);
    this.add.text(103,78,'A CORTE',{fontFamily:'monospace',fontSize:'10px',color:'#e1a6ac'}).setOrigin(.5);
    const acted=state.acted||[];
    function figure(scene,u,enemy,x,y,selected,scale=1){
      const c=scene.add.container(x,y);c.setDepth(100+y);c.setScale(scale);
      const shadow=scene.add.ellipse(0,6,65,12,0x02080e,.57);
      c.add(shadow);
      let actor;
      if(spriteReady){
        // Kenney's sheet contains front-facing, layered 16px sprites.
        // Use base characters from first columns; preserve original colors.
        const heroRows={coto:4,marga:9,iria:8,silas:5,olmo:7,dara:10,vega:11,lorena:3};
        const foeRows={guarda:2,arqueiro:3,carcereiro:5,sabujo:0,lancas:3,espectro:11,carniceiro:5,bruxa:9,cavaleiro:5,ulorian:11};
        const row=enemy?(foeRows[u.key]??((Number(u.id)||0)%9+1)):(heroRows[u.id]??4);
        let col=enemy?1:0;
        // Avoid transparent cells in externally supplied tilesheets.
        // Deterministic search keeps the same appearance after scene restarts.
        let actualRow=row;
        if(!hasVisiblePixels(col,actualRow)){
          const possibilities=Array.from({length:16},(_,i)=>(row+i)%16);
          const available=possibilities.find(candidate=>hasVisiblePixels(col,candidate));
          if(available!==undefined)actualRow=available;
        }
        const valid=hasVisiblePixels(col,actualRow);
        const frame='kenney-'+col+'-'+actualRow;
        if(valid){
          if(!scene.textures.get('kenney').has(frame))scene.textures.get('kenney').add(frame,0,col*17,actualRow*17,16,16);
          actor=scene.add.image(0,-44,'kenney',frame).setScale(3.05).setOrigin(.5,.8);
          if(enemy)actor.setFlipX(true);
          c.add(actor);
        }
      }
      if(!actor){
        // Never allow an invisible unit: draw a readable local silhouette.
        actor=scene.add.container(0,-42);
        const coat=scene.add.rectangle(0,1,37,41,enemy?0x835460:0x568579).setStrokeStyle(2,0x20252c);
        const face=scene.add.rectangle(0,-29,26,21,0xdab598);
        const hair=scene.add.rectangle(0,-41,30,8,enemy?0x6a6e78:0x513d34);
        const legs=[scene.add.rectangle(-10,29,12,17,0x333a40),scene.add.rectangle(10,29,12,17,0x333a40)];
        actor.add([coat,face,hair,...legs]);c.add(actor);
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
      // Keep the HUD outside the scaled sprite: text stays readable even with four units.
      const hud=scene.add.container(x,y+12).setDepth(800);
      const panel=scene.add.rectangle(0,14,104,36,0x101c27,.85).setStrokeStyle(1,enemy?0x8e5e69:0x65877d);
      const hpBack=scene.add.rectangle(0,1,95,6,0x332932);
      const hpFill=scene.add.rectangle(-47,1,94*Math.max(0,Math.min(1,u.hp/max)),5,enemy?0xcf7b81:0x86c7a3).setOrigin(0,.5);
      const shortName=u.name.length>16?u.name.slice(0,15)+'…':u.name;
      const label=scene.add.text(0,12,shortName,{fontFamily:'monospace',fontSize:'9px',color:'#f6e8d4'}).setOrigin(.5);
      const stats=scene.add.text(0,25,u.hp+'/'+u.maxhp+' PV'+(enemy?'':' / '+u.mp+' F'),{fontFamily:'monospace',fontSize:'9px',color:'#edcf9f'}).setOrigin(.5);
      hud.add([panel,hpBack,hpFill,label,stats]);
      const key=(enemy?'e':'h')+u.id;
      unitsByKey.set(key,{c,actor,x,y});
      const hit=scene.add.zone(x,y-31*scale,104,Math.min(64,88*scale)).setDepth(900).setInteractive({useHandCursor:true});
      hit.on('pointerdown',()=>{if(u.hp<=0)return;window.RevoltBattleBridge.command((enemy?'targetE:':'selectHero:')+u.id)});
      scene.tweens.add({targets:c,y:y-2.5*scale,duration:900+((Number(u.id)||0)*117)%400,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }
    // Two clearly separated columns, max four fighters each, no overlapping labels.
    const draw=(units,enemy)=>{
      const n=units.length;
      // JRPG-style staggered ranks; foes left, resistance right.
      const positions={
        1:[{y:242,dx:0}],
        2:[{y:190,dx:-17},{y:305,dx:18}],
        3:[{y:149,dx:-16},{y:250,dx:22},{y:352,dx:-8}],
        4:[{y:135,dx:-16},{y:207,dx:17},{y:279,dx:-16},{y:351,dx:17}]
      };
      const slots=positions[Math.min(4,n)]||positions[1];
      const scale=n===1?.90:n===2?.78:n===3?.68:.60;
      units.forEach((u,i)=>{
        const pos=slots[i]||slots[slots.length-1];
        const x=(enemy?101:319)+(enemy?pos.dx:-pos.dx);
        figure(this,u,enemy,x,pos.y,state.selected===(enemy?'e':'h')+u.id,scale);
      });
    };
    draw(state.heroes,false);draw(state.enemies,true);
    // Transitions are derived from canonical HP changes, never from guessed damage.
    if(previous){
      // A newly acted hero visibly surges toward the opposing line.
      const prevActed=new Set(previous.acted||[]);
      for(const id of state.acted||[]){
        if(prevActed.has(id))continue;
        const actor=unitsByKey.get('h'+id);
        if(actor&&state.heroes.some(h=>h.id===id&&h.hp>0)){
          this.tweens.add({targets:actor.c,x:actor.x-32,duration:125,yoyo:true,ease:'Quad.easeOut'});
          const swish=this.add.ellipse(actor.x-42,actor.y-45,26,7,0xe6d9a3,.85).setRotation(-.6).setDepth(30);
          this.tweens.add({targets:swish,x:swish.x-30,alpha:0,duration:240,onComplete:()=>swish.destroy()});
        }
      }
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
          this.tweens.add({targets:entry.c,x:entry.x+(current._key[0]==='e'?10:-10),duration:95,yoyo:true});
        }else{
          const ring=this.add.circle(entry.x,entry.y-43,16,0x8be5af,.36).setDepth(8);
          this.tweens.add({targets:ring,scale:3,alpha:0,duration:420,onComplete:()=>ring.destroy()});
        }
      }
    }
    g.fillStyle(0x131f2a).fillRect(0,409,W,151);
    g.lineStyle(2,0x957659).lineBetween(0,409,W,409);
    const targetEnemy=state.targetMode==='ataque'||state.targetMode==='skillEnemy';
    const targetAlly=state.targetMode==='heal'||state.targetMode==='potionAlly';
    const hint=targetEnemy?'TOQUE EM UM INIMIGO':targetAlly?'TOQUE EM UM ALIADO':'SELECIONE UM COMBATENTE';
    this.add.text(W/2,425,hint,{fontFamily:'monospace',fontSize:'12px',color:'#ebc68c'}).setOrigin(.5);
    const selected=state.selected?.startsWith('h')?state.heroes.find(h=>'h'+h.id===state.selected):null;
    const canAct=!!selected&&selected.hp>0&&!acted.includes(selected.id);
    const waiting=state.heroes.some(h=>h.hp>0&&!acted.includes(h.id));
    const button=(x,y,w,label,command,enabled,accent=false)=>{
      const r=this.add.rectangle(x,y,w,34,enabled?(accent?0x725239:0x2d4951):0x27313b).setStrokeStyle(2,enabled?0xb89769:0x4e5861);
      this.add.text(x,y,label,{fontFamily:'monospace',fontSize:'11px',color:enabled?'#f6e7cb':'#8b9497'}).setOrigin(.5);
      if(enabled)r.setInteractive({useHandCursor:true}).on('pointerdown',()=>window.RevoltBattleBridge.command(command));
    };
    if(state.targetMode){button(210,463,385,'✕ CANCELAR ALVO','cancelTarget',true);}
    else{
      button(109,455,193,'⚔ ATACAR','attack',canAct,true);
      button(311,455,193,'✦ HABILIDADE','skill',canAct&&selected.mp>=8);
      button(109,494,193,'✚ CURATIVO ('+state.herbs+')','potion',canAct&&state.herbs>0);
      button(311,494,193,'⬡ DEFENDER','defend',canAct);
    }
    button(210,539,397,'ENCERRAR RODADA · VEZ DA CORTE','enemyTurn',!waiting);
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
