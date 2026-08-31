(()=>{
  if(!window.MediaRecorder || window.__teleprompterRecorderFix) return;
  window.__teleprompterRecorderFix=true;

  const proto=MediaRecorder.prototype;
  const nativeStart=proto.start;
  const nativeRequestData=proto.requestData;
  const isiOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

  proto.start=function(){
    // En iPhone evitamos timeslice: Safari puede generar MP4 fragmentados
    // que terminan perdiendo la pista de audio en grabaciones más largas.
    return nativeStart.call(this);
  };

  if(isiOS && nativeRequestData){
    proto.requestData=function(){
      // Evitamos forzar fragmentos MP4 intermedios al pausar.
      if(this.state==='recording' && /mp4/i.test(this.mimeType||'')) return;
      return nativeRequestData.call(this);
    };
  }
})();