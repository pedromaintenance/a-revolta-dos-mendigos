/* Revolta dos Mendigos — service worker v18. Phaser usa CDN; campanha clássica permanece offline. */
'use strict';
const CACHE='revolta-cache-v18';
const CORE=['./','./index.html','./style.css','./data.js','./app.js','./phaser-battle.js','./battle-popup.js','./manifest.webmanifest','./icons/icon-192.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('revolta-cache-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const isDocument=req.mode==='navigate';
 const isCode=/\.(?:html|js|css|webmanifest)(?:$|\?)/.test(new URL(req.url).pathname);
 if(isDocument||isCode){
  event.respondWith(fetch(req).then(response=>{
   if(response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(req,clone)).catch(()=>{});}
   return response;
  }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
 }else{
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(response=>{
   if(response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(req,clone)).catch(()=>{});}
   return response;
  })));
 }
});
