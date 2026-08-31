(()=>{
  if(window.__teleprompterFreshStreamFix) return;
  window.__teleprompterFreshStreamFix=true;

  const isiOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!isiOS) return;

  let bypass=false;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  async function waitForFreshStream(oldStream){
    const cam=document.getElementById('cam');
    const start=Date.now();
    while(Date.now()-start<5000){
      const s=cam?.srcObject;
      const a=s?.getAudioTracks?.()[0];
      const v=s?.getVideoTracks?.()[0];
      if(s && s!==oldStream && a?.readyState==='live' && v?.readyState==='live') return true;
      await sleep(80);
    }
    return false;
  }

  document.addEventListener('click',async e=>{
    const btn=e.target?.closest?.('#record');
    if(!btn || bypass) return;

    // Si ya está grabando, dejamos pasar el clic normal para detener.
    if(btn.classList.contains('stop')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const cam=document.getElementById('cam');
    const activate=document.getElementById('activate');
    const status=document.getElementById('status');
    const oldStream=cam?.srcObject||null;

    // Cerramos cualquier sesión anterior de cámara/micrófono.
    try{oldStream?.getTracks?.().forEach(t=>t.stop())}catch{}
    if(status) status.textContent='Preparando cámara y micrófono para una grabación nueva…';

    // La función de cámara original crea un MediaStream nuevo y lo asigna a cam.srcObject.
    activate?.click();
    const ok=await waitForFreshStream(oldStream);

    if(!ok){
      if(status) status.textContent='No se pudo reiniciar el micrófono. Pulsa Activar cámara y prueba de nuevo.';
      return;
    }

    // Damos un pequeño margen a iOS para estabilizar la nueva pista de audio.
    await sleep(300);
    const fresh=cam.srcObject;
    const audio=fresh?.getAudioTracks?.()[0];
    if(!audio || audio.readyState!=='live' || audio.muted){
      if(status) status.textContent='El micrófono no está listo. Vuelve a intentarlo.';
      return;
    }

    bypass=true;
    try{btn.click()}finally{setTimeout(()=>{bypass=false},0)}
  },true);
})();