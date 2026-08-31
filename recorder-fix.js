(()=>{
  if(!window.MediaRecorder || window.__teleprompterRecorderFixV5) return;
  window.__teleprompterRecorderFixV5=true;

  const isiOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!isiOS) return;

  // 1) Deja a iOS elegir la configuración de micrófono más estable.
  try{
    const md=navigator.mediaDevices;
    if(md?.getUserMedia && !md.__teleprompterNativeAudio){
      const nativeGUM=md.getUserMedia.bind(md);
      md.getUserMedia=(constraints={})=>{
        const c={...constraints};
        if(c.audio) c.audio=true;
        return nativeGUM(c);
      };
      md.__teleprompterNativeAudio=true;
    }
  }catch{}

  // 2) En iPhone no forzamos MP4/H264/AAC ni bitrates.
  // Safari elige el contenedor/códecs que mejor mantiene audio+vídeo juntos.
  const NativeMR=window.MediaRecorder;
  function SafariMediaRecorder(stream){
    return new NativeMR(stream);
  }
  SafariMediaRecorder.prototype=NativeMR.prototype;
  try{Object.setPrototypeOf(SafariMediaRecorder,NativeMR)}catch{}
  SafariMediaRecorder.isTypeSupported=()=>false;
  window.MediaRecorder=SafariMediaRecorder;

  // 3) Vaciado periódico para evitar que Safari acumule toda la sesión y congele vídeo.
  const nativeStart=NativeMR.prototype.start;
  const nativeRequestData=NativeMR.prototype.requestData;
  NativeMR.prototype.start=function(){
    return nativeStart.call(this,4000);
  };

  if(nativeRequestData){
    NativeMR.prototype.requestData=function(){
      // No forzar fragmentos extra al pausar; el timeslice ya vacía el buffer.
      if(this.state==='recording') return;
      return nativeRequestData.call(this);
    };
  }
})();