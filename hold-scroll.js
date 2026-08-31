(()=>{
  const shell=document.getElementById('shell');
  const prompt=document.getElementById('prompt');
  const scroll=document.getElementById('scroll');
  if(!shell||!prompt||!scroll||window.__teleprompterHoldScroll)return;
  window.__teleprompterHoldScroll=true;

  shell.style.pointerEvents='auto';
  shell.style.touchAction='none';
  prompt.style.pointerEvents='auto';
  prompt.style.touchAction='none';

  let holding=false;
  let shouldResume=false;

  const isRecording=()=>document.body.classList.contains('recordingMode');

  function holdStart(e){
    if(!isRecording()||holding)return;
    holding=true;
    shouldResume=true;
    try{shell.setPointerCapture?.(e.pointerId)}catch{}
    // El botón ▶ alterna el scroll. Durante una grabación normalmente está activo;
    // al pulsar el texto lo detenemos sin tocar MediaRecorder.
    scroll.click();
    prompt.style.opacity='.82';
    e.preventDefault();
  }

  function holdEnd(e){
    if(!holding)return;
    holding=false;
    try{shell.releasePointerCapture?.(e.pointerId)}catch{}
    prompt.style.opacity='1';
    if(shouldResume&&isRecording()) scroll.click();
    shouldResume=false;
    e.preventDefault();
  }

  shell.addEventListener('pointerdown',holdStart,{passive:false});
  shell.addEventListener('pointerup',holdEnd,{passive:false});
  shell.addEventListener('pointercancel',holdEnd,{passive:false});
  shell.addEventListener('lostpointercapture',()=>{
    if(holding) holdEnd(new Event('pointerup',{cancelable:true}));
  });
})();