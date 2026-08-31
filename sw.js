const CACHE='teleprompter-recorder-v4';
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./cloud.js','./recorder-fix.js','./hold-scroll.js'])).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  ]));
});
self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
      let html=await r.text();
      if(!html.includes('recorder-fix.js')) html=html.replace('</body>','<script src="./recorder-fix.js?v=3"></script></body>');
      if(!html.includes('hold-scroll.js')) html=html.replace('</body>','<script src="./hold-scroll.js?v=1"></script></body>');
      if(!html.includes('cloud.js')) html=html.replace('</body>','<script src="./cloud.js?v=1"></script></body>');
      return new Response(html,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
});