// Background, speech recognition and offline logging
(function(){
  // --- Three.js Fluid Background ---
  const canvas = document.getElementById('bg-canvas');
  if (canvas && window.THREE) {
    const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);} 
        float noise(vec2 st){vec2 i=floor(st);vec2 f=fract(st);float a=random(i);float b=random(i+vec2(1.0,0.0));float c=random(i+vec2(0.0,1.0));float d=random(i+vec2(1.0,1.0));vec2 u=f*f*(3.0-2.0*f);return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;} 
        void main(){
          vec2 st=gl_FragCoord.xy/uResolution.xy*3.0;
          float n=noise(st+uTime*0.1);
          gl_FragColor=vec4(vec3(0.2,0.3,0.5)+0.3*vec3(n,n*0.5,n*0.8),1.0);
        }
      `
    });
    scene.add(new THREE.Mesh(geometry, material));
    function animate(){
      requestAnimationFrame(animate);
      uniforms.uTime.value += 0.05;
      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', ()=>{
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });
  }

  // --- Speech Recognition & Emotion Colors ---
  const speechBtn = document.getElementById('speech-btn');
  const speechOutput = document.getElementById('speech-output');
  let recognition;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.onresult = (e)=>{
      const text = e.results[0][0].transcript;
      const emotions = classifyText(text);
      speechOutput.textContent = `${text} ` + JSON.stringify(emotions);
      updateEmotionColors(emotions);
      addLog({ text, emotions });
    };
    speechBtn && speechBtn.addEventListener('click', ()=> recognition.start());
  } else {
    if (speechBtn) speechBtn.style.display = 'none';
  }

  function classifyText(text) {
    const result = { positive: 0.33, neutral: 0.34, negative: 0.33 };
    const posWords = ['开心','快乐','好','棒','喜欢'];
    const negWords = ['难过','不好','讨厌','生气','糟糕'];
    let pos=0, neg=0;
    posWords.forEach(w=>{ if(text.includes(w)) pos++; });
    negWords.forEach(w=>{ if(text.includes(w)) neg++; });
    if (pos+neg > 0) {
      const total = pos+neg;
      result.positive = pos/total;
      result.negative = neg/total;
      result.neutral = 1 - result.positive - result.negative;
    }
    return result;
  }

  const EMOTION_COLORS = {
    positive: [140, 80, 60],
    neutral: [210, 60, 60],
    negative: [0, 80, 60]
  };

  function updateEmotionColors(weights) {
    let h=0,s=0,l=0,total=0;
    for (const k in weights) {
      const w = weights[k];
      const c = EMOTION_COLORS[k];
      if (!c) continue;
      h += c[0]*w; s += c[1]*w; l += c[2]*w; total += w;
    }
    if (total === 0) return;
    const start = `hsl(${h/total}, ${s/total}%, ${l/total}%)`;
    const end = `hsl(${(h/total + 40.0)%360}, ${s/total}%, ${Math.min(100, l/total + 10)}%)`;
    document.documentElement.style.setProperty('--bg-start', start);
    document.documentElement.style.setProperty('--bg-end', end);
  }

  // --- IndexedDB Logging ---
  let db;
  const req = indexedDB.open('debuff-logs', 1);
  req.onupgradeneeded = e => {
    e.target.result.createObjectStore('logs', { autoIncrement: true });
  };
  req.onsuccess = e => {
    db = e.target.result;
  };
  function addLog(entry){
    if (!db) return;
    const tx = db.transaction('logs', 'readwrite');
    tx.objectStore('logs').add({ ...entry, timestamp: Date.now() });
  }

  // --- Service Worker Registration ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
})();
