(()=>{
  if(!window.MediaRecorder || window.__teleprompterRecorderFix) return;
  window.__teleprompterRecorderFix=true;

  const proto=MediaRecorder.prototype;
  const nativeStart=proto.start;
  const nativeRequestData=proto.requestData;
  const isiOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

  proto.start=function(timeslice){
    if(isiOS){
      // Safari iOS puede congelar la pista de vídeo si acumula toda la grabación
      // en memoria. 5 s reduce presión sin trocear en exceso el MP4.
      return nativeStart.call(this,5000);
    }
    return nativeStart.call(this,timeslice);
  };

  if(isiOS && nativeRequestData){
    proto.requestData=function(){
      // Evitamos fragmentos manuales al pausar; dejamos que el timeslice haga
      // el vaciado periódico para mantener audio y vídeo sincronizados.
      if(this.state==='recording' && /mp4/i.test(this.mimeType||'')) return;
      return nativeRequestData.call(this);
    };
  }
})();