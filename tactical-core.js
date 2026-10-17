/* Tactical prototype core: no DOM, Phaser, storage or global campaign state. */
(function(root){
'use strict';
const W=10,H=9;
const walls=new Set(['3,1','3,2','6,5','6,6','2,6']);
const water=new Set(['4,0','5,0','4,1','5,1','4,2','5,2','4,3','5,3','4,4','5,4','4,5','5,5','4,6','5,6','4,7','5,7','4,8','5,8']);
const bridges=new Set(['4,3','5,3','4,4','5,4']);
const key=(x,y)=>x+','+y;
const inside=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
function passable(x,y){return inside(x,y)&&!walls.has(key(x,y))&&(!water.has(key(x,y))||bridges.has(key(x,y)))}
function initial(){return {turn:1,phase:'player',selected:null,moved:false,attacked:false,over:false,win:false,units:[{id:'coto',side:'ally',name:'Coto da Ponte',x:1,y:4,hp:32,maxhp:32,atk:11,def:4,move:3},{id:'guarda',side:'enemy',name:'Guarda de Tributo',x:8,y:3,hp:28,maxhp:28,atk:8,def:2,move:2}],log:['Um guarda tenta confiscar a primeira espada.']};}
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function reachable(state,id){
 const unit=state.units.find(u=>u.id===id&&u.hp>0);
 if(!unit)return [];
 const occupied=new Set(state.units.filter(u=>u.hp>0&&u.id!==id).map(u=>key(u.x,u.y)));
 const q=[{x:unit.x,y:unit.y,cost:0}],dist=new Map([[key(unit.x,unit.y),0]]);
 for(let i=0;i<q.length;i++){let p=q[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let x=p.x+dx,y=p.y+dy,k=key(x,y),cost=p.cost+1;if(cost>unit.move||!passable(x,y)||occupied.has(k)||(dist.has(k)&&dist.get(k)<=cost))continue;dist.set(k,cost);q.push({x,y,cost});}}
 return [...dist.entries()].filter(([k])=>k!==key(unit.x,unit.y)).map(([k,cost])=>{let [x,y]=k.split(',').map(Number);return{x,y,cost}});
}
function forecast(attacker,defender){return {damage:Math.max(1,attacker.atk-Math.floor(defender.def/2)),counter:distance(attacker,defender)===1?Math.max(1,defender.atk-Math.floor(attacker.def/2)):0};}
function attack(state,a,b){
 if(state.over||a.hp<=0||b.hp<=0||a.side===b.side||distance(a,b)!==1)return false;
 const f=forecast(a,b);b.hp=Math.max(0,b.hp-f.damage);state.log.unshift(a.name+' causou '+f.damage+' de dano.');
 if(b.hp>0&&f.counter>0){a.hp=Math.max(0,a.hp-f.counter);state.log.unshift(b.name+' contra-atacou ('+f.counter+').');}
 if(b.hp<=0)state.log.unshift(b.name+' foi derrotado.');if(a.hp<=0)state.log.unshift(a.name+' caiu.');
 return true;
}
function endCheck(s){const c=s.units.find(u=>u.id==='coto'),e=s.units.find(u=>u.id==='guarda');if(c.hp<=0||e.hp<=0){s.over=true;s.win=e.hp<=0;s.phase='end';s.log.unshift(s.win?'Vitória: o povo mantém a espada.':'Derrota: a Corte tomou a espada.');}}
function enemyTurn(s){
 const e=s.units.find(u=>u.id==='guarda'),c=s.units.find(u=>u.id==='coto');
 if(!e||!c||e.hp<=0||c.hp<=0)return;
 if(distance(e,c)>1){const moves=reachable(s,e.id).sort((a,b)=>(Math.abs(a.x-c.x)+Math.abs(a.y-c.y))-(Math.abs(b.x-c.x)+Math.abs(b.y-c.y))||a.cost-b.cost);if(moves.length){e.x=moves[0].x;e.y=moves[0].y;s.log.unshift('Guarda avança pela ponte.');}}
 if(distance(e,c)===1)attack(s,e,c);
 endCheck(s);
}
function dispatch(state,action){
 const s=JSON.parse(JSON.stringify(state));if(s.over)return s;
 const c=s.units.find(u=>u.id==='coto'),e=s.units.find(u=>u.id==='guarda');
 if(action.type==='select'){if(action.id==='coto'&&c.hp>0)s.selected='coto';return s;}
 if(s.phase!=='player')return s;
 if(action.type==='move'&&!s.moved&&s.selected==='coto'&&reachable(s,'coto').some(p=>p.x===action.x&&p.y===action.y)){c.x=action.x;c.y=action.y;s.moved=true;s.log.unshift('Coto se reposicionou.');return s;}
 if(action.type==='attack'&&s.selected==='coto'&&!s.attacked&&distance(c,e)===1){attack(s,c,e);s.attacked=true;endCheck(s);return s;}
 if(action.type==='end'){s.phase='enemy';enemyTurn(s);if(!s.over){s.turn++;s.phase='player';s.moved=false;s.attacked=false;s.selected=null;}return s;}
 return s;
}
root.RevoltTactics={W,H,walls,water,bridges,key,passable,initial,reachable,forecast,dispatch,distance};
})(typeof window!=='undefined'?window:globalThis);
