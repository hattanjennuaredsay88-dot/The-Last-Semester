/* Audio procedural orisinal untuk The Last Semester. Tidak memakai OST berhak cipta. */
(() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  const A = {
    ctx:null, master:null, music:null, timer:null, scene:"menu", volume:.58, muted:false, step:0, lastSfx:0,
    patterns:{
      menu:{bpm:76,notes:[261.63,392,329.63,523.25,392,329.63,293.66,440],wave:"sine",bass:[130.81,196,164.81,146.83]},
      home:{bpm:68,notes:[261.63,329.63,392,329.63,293.66,349.23,392,523.25],wave:"triangle",bass:[130.81,146.83,174.61,196]},
      village:{bpm:86,notes:[392,440,523.25,440,392,329.63,349.23,392],wave:"triangle",bass:[196,174.61,146.83,164.81]},
      school:{bpm:96,notes:[329.63,392,440,392,349.23,392,523.25,440],wave:"sine",bass:[164.81,196,174.61,146.83]},
      canteen:{bpm:108,notes:[392,440,523.25,587.33,523.25,440,392,349.23],wave:"triangle",bass:[196,220,174.61,164.81]},
      warm:{bpm:72,notes:[261.63,329.63,392,493.88,440,392,329.63,293.66],wave:"sine",bass:[130.81,164.81,196,146.83]},
      sad:{bpm:62,notes:[220,261.63,293.66,261.63,246.94,220,196,246.94],wave:"triangle",bass:[110,130.81,123.47,98]},
      tense:{bpm:124,notes:[196,233.08,196,277.18,246.94,196,174.61,233.08],wave:"sawtooth",bass:[98,116.54,87.31,103.83]},
      backyard:{bpm:116,notes:[196,233.08,207.65,174.61,196,261.63,233.08,174.61],wave:"triangle",bass:[98,116.54,103.83,87.31]}
    },
    init(){if(!AC)return;if(!this.ctx){this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:this.volume;this.master.connect(this.ctx.destination);this.music=this.ctx.createGain();this.music.gain.value=.58;this.music.connect(this.master);}if(this.ctx.state==="suspended")this.ctx.resume().then(()=>{if(!this.timer)this.startMusic(this.scene);});},
    tone(freq,dur=.35,wave="sine",gain=.03,when=0,dest=this.music){if(!this.ctx||!dest)return;const t=this.ctx.currentTime+when,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=wave;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.035);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.03);},
    stopMusic(){if(this.timer)clearInterval(this.timer);this.timer=null;},
    startMusic(scene){const p=this.patterns[scene]||this.patterns.school;this.stopMusic();this.step=0;const beat=60/p.bpm;const play=()=>{if(!this.ctx||this.muted)return;const i=this.step++%p.notes.length;this.tone(p.notes[i],beat*1.65,p.wave,.025);if(i%2===0)this.tone(p.bass[(i/2)%p.bass.length],beat*1.9,"sine",.018);if(["menu","home","warm","sad"].includes(scene))this.tone(p.notes[(i+2)%p.notes.length]*1.5,beat*2.2,"sine",.009,beat*.18);};play();this.timer=setInterval(play,beat*1000);},
    setScene(s){if(!s||s===this.scene)return;this.scene=s;if(this.ctx&&this.ctx.state==="running")this.startMusic(s);},
    sfx(k){this.init();if(!this.ctx||this.muted)return;const t=this.ctx.currentTime;if(k==="step"){if(t-this.lastSfx<.28)return;this.lastSfx=t;this.tone(105+Math.random()*28,.07,"triangle",.012,0,this.master);}else if(k==="bell"){[880,1174.66,1567.98].forEach((f,i)=>this.tone(f,1.1,"sine",.045,i*.08,this.master));}else if(k==="click")this.tone(660,.06,"square",.018,0,this.master);else if(k==="door"){this.tone(190,.12,"triangle",.025,0,this.master);this.tone(310,.18,"sine",.018,.07,this.master);}else if(k==="choice"){this.tone(523.25,.13,"sine",.028,0,this.master);this.tone(659.25,.16,"sine",.02,.09,this.master);}else if(k==="alert"){this.tone(220,.22,"sawtooth",.035,0,this.master);this.tone(174.61,.3,"sawtooth",.025,.18,this.master);}},
    setVolume(v){this.volume=Math.max(0,Math.min(1,Number(v)));if(this.master&&!this.muted)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.04);},
    toggle(){this.init();this.muted=!this.muted;if(this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume,this.ctx.currentTime,.04);if(!this.muted)this.startMusic(this.scene);return !this.muted;},
    menu(){this.init();this.setScene("menu");},pause(v){if(this.music&&this.ctx)this.music.gain.setTargetAtTime(v?.08:.58,this.ctx.currentTime,.2);}
  };
  window.TLSAudio=A;
  const unlock=()=>A.init();window.addEventListener("pointerdown",unlock,{once:true});window.addEventListener("keydown",unlock,{once:true});
  document.addEventListener("click",(e)=>{if(e.target.closest("button") && !e.target.closest("#audioToggle"))A.sfx("click");});
})();
