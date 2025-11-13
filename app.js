// Constants
const TIMER = {
  WORK_DURATION_MINUTES: 25,
  SHORT_BREAK_DURATION_MINUTES: 5,
  LONG_BREAK_DURATION_MINUTES: 15,
  TOTAL_WORK_PERIODS: 4,
  SECONDS_PER_MINUTE: 60,
  UPDATE_INTERVAL_MS: 1000
};

const AUDIO = {
  DEFAULT_MUSIC_VOLUME: 0.6,
  DEFAULT_RAIN_VOLUME: 0.3,
  DEFAULT_VINYL_VOLUME: 0.8,
  DEFAULT_SPEED: 1,
  MIN_SPEED: 0.85,
  MAX_SPEED: 1.2,
  SPEED_STEP: 0.05,
  VOLUME_STEP: 0.01,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1
};

const UI = {
  DOUBLE_DING_DELAY_MS: 500,
  PLAYBACK_RATE_UPDATE_DELAY_MS: 100
};

const VERSION = 'v1.1';

// Lofi music streams
const streams = {
  main: 'https://stream.zeno.fm/0r0xa792kwzuv',
  metadata: 'https://api.zeno.fm/mounts/metadata/subscribe/0r0xa792kwzuv',
};

const els = {
  radio: document.getElementById('radio'),
  track: document.getElementById('track'),
  btnPlay: document.getElementById('btnPlay'),
  btnRain: document.getElementById('btnRain'),
  btnVinyl: document.getElementById('btnVinyl'),
  volMusic: document.getElementById('volMusic'),
  volRain: document.getElementById('volRain'),
  volVinyl: document.getElementById('volVinyl'),
  status: document.getElementById('status'),
  statusDot: document.getElementById('statusDot'),
  btnInstall: document.getElementById('btnInstall'),
  speed: document.getElementById('speed'),
  speedValue: document.getElementById('speedValue'),
  musicValue: document.getElementById('musicValue'),
  rainValue: document.getElementById('rainValue'),
  vinylValue: document.getElementById('vinylValue'),
  // Timer card
  sessionType: document.getElementById('sessionType'),
  sessionNumber: document.getElementById('sessionNumber'),
  timeRemaining: document.getElementById('timeRemaining'),
};

let ctx, mainGain, rainGain, vinylGain;
let sfxBuffers = {};
let rainSource = null;
let vinylSource = null;
let radioSource = null;

// Timer variables
let timerInterval = null;
let timeRemaining = TIMER.WORK_DURATION_MINUTES * TIMER.SECONDS_PER_MINUTE;
let isWorkTimer = true;
let workPeriod = 1;
let isLongBreak = false;

// Track info
let currentTrackInfo = '';
let isPlaying = false;

// --- Audio Context ---
function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  // Gains
  mainGain = ctx.createGain();
  rainGain = ctx.createGain();
  vinylGain = ctx.createGain();

  mainGain.connect(ctx.destination);
  rainGain.connect(ctx.destination);
  vinylGain.connect(ctx.destination);

  // Radio through mainGain (only create once)
  if (!radioSource) {
    radioSource = ctx.createMediaElementSource(els.radio);
    radioSource.connect(mainGain);
  }
}

function setStatus(text, color) {
  els.status.textContent = text;
  if (color) els.statusDot.style.background = color;
}

function updateTrackDisplay() {
  if (els.track) {
    if (isPlaying && currentTrackInfo) {
      els.track.textContent = `Now Playing: ${currentTrackInfo}`;
    } else {
      els.track.textContent = `${VERSION}`;
    }
  }
}

function setPlaybackRate(rate) {
  if (els.radio) {
    els.radio.playbackRate = rate;
  }
}

// Update slider value displays
function updateSpeedValue(value) {
  if (els.speedValue) {
    els.speedValue.textContent = `${value}x`;
  }
}

function updateVolumeValue(element, value) {
  const percentage = Math.round(value * 100);
  if (element) {
    element.textContent = `${percentage}%`;
  }
}

// --- SFX (Rain + Vinyl) ---
async function setupSFX() {
  if (!ctx) initAudio(); // reuse same context

  async function loadSFX(name, url) {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    sfxBuffers[name] = await ctx.decodeAudioData(arr);
  }

  await Promise.all([
    loadSFX("rain", "assets/rain.wav"),
    loadSFX("vinyl", "assets/vinyl.wav"),
    loadSFX("ding", "assets/ding.wav"),
    loadSFX("alarmbeep", "assets/alarmbeep.wav"),
  ]);
}

function playLoop(name, gainNode) {
  if (!sfxBuffers[name]) return null;
  const src = ctx.createBufferSource();
  src.buffer = sfxBuffers[name];
  src.loop = true;
  src.connect(gainNode);
  src.start(0);
  return src;
}

function playSFX(name) {
  if (!sfxBuffers[name] || !ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = sfxBuffers[name];
  src.loop = false;
  src.connect(ctx.destination);
  src.start(0);
}

function playDoubleDing() {
  if (!sfxBuffers["ding"] || !ctx) return;
  
  // Play first ding
  const src1 = ctx.createBufferSource();
  src1.buffer = sfxBuffers["ding"];
  src1.loop = false;
  src1.connect(ctx.destination);
  src1.start(0);
  
  // Play second ding after delay
  setTimeout(() => {
    const src2 = ctx.createBufferSource();
    src2.buffer = sfxBuffers["ding"];
    src2.loop = false;
    src2.connect(ctx.destination);
    src2.start(0);
  }, UI.DOUBLE_DING_DELAY_MS);
}

function toggleRain() {
  if (rainSource) {
    rainSource.stop();
    rainSource.disconnect();
    rainSource = null;
    els.btnRain.textContent = "Rain: Off";
  } else {
    rainSource = playLoop("rain", rainGain);
    els.btnRain.textContent = "Rain: On";
  }
}

function toggleVinyl() {
  if (vinylSource) {
    vinylSource.stop();
    vinylSource.disconnect();
    vinylSource = null;
    els.btnVinyl.textContent = "Vinyl: Off";
  } else {
    vinylSource = playLoop("vinyl", vinylGain);
    els.btnVinyl.textContent = "Vinyl: On";
  }
}

// --- Timer Functions ---
function formatTime(seconds) {
  const minutes = Math.floor(seconds / TIMER.SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % TIMER.SECONDS_PER_MINUTE;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimer() {
  if (els.sessionType) {
    if (isWorkTimer) {
      els.sessionType.textContent = "Work";
    } else {
      els.sessionType.textContent = isLongBreak ? "Long Break" : "Break";
    }
    els.sessionNumber.textContent = `${workPeriod}/${TIMER.TOTAL_WORK_PERIODS}`;
  }
  
  if (els.timeRemaining) {
    els.timeRemaining.textContent = formatTime(timeRemaining);
  }
}

function startTimer() {
  if (timerInterval) return; // Already running
  
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimer();
    } else {
      stopTimer();
      
      if (isWorkTimer) {
        // Work timer finished
        if (workPeriod === TIMER.TOTAL_WORK_PERIODS) {
          // Last work period finished - start long break
          playDoubleDing();
          isWorkTimer = false;
          isLongBreak = true;
          timeRemaining = TIMER.LONG_BREAK_DURATION_MINUTES * TIMER.SECONDS_PER_MINUTE;
        } else {
          // Work period finished - start short break
          playSFX("ding");
          isWorkTimer = false;
          isLongBreak = false;
          timeRemaining = TIMER.SHORT_BREAK_DURATION_MINUTES * TIMER.SECONDS_PER_MINUTE;
        }
        updateTimer();
        startTimer(); // Start the break timer
      } else {
        // Break timer finished - start next work period
        playSFX("alarmbeep");
        isWorkTimer = true;
        isLongBreak = false;
        
        if (workPeriod === TIMER.TOTAL_WORK_PERIODS) {
          // Long break finished - reset to 1st work period
          workPeriod = 1;
        } else {
          // Short break finished - move to next work period
          workPeriod++;
        }
        
        timeRemaining = TIMER.WORK_DURATION_MINUTES * TIMER.SECONDS_PER_MINUTE;
        updateTimer();
        startTimer(); // Start the work timer
      }
    }
  }, TIMER.UPDATE_INTERVAL_MS);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  stopTimer();
  isWorkTimer = true;
  workPeriod = 1;
  isLongBreak = false;
  timeRemaining = TIMER.WORK_DURATION_MINUTES * TIMER.SECONDS_PER_MINUTE;
  updateTimer();
}

// --- UI Bindings ---
function bindUI() {
  els.btnPlay.addEventListener('click', async () => {
    initAudio();
    
    // Resume audio context if suspended (required for autoplay policies)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Initialize volume controls
    if (mainGain) {
      mainGain.gain.value = parseFloat(els.volMusic.value);
    }
    
    if (els.radio.paused) {
      // When resuming from pause, restart the stream to get current content
      els.radio.src = streams.main;
      els.radio.playbackRate = parseFloat(els.speed.value);
      
      try {
        await els.radio.play();
        els.btnPlay.textContent = '| |';
        setStatus('Playing', '#22c55e');
        isPlaying = true;
        updateTrackDisplay();
        startTimer(); // Start/resume timer when playing
      } catch (err) {
        setStatus('Tap to start (autoplay blocked)', '#f59e0b');
      }
    } else {
      els.radio.pause();
      els.btnPlay.textContent = '▶';
      setStatus('Paused', '#f59e0b');
      isPlaying = false;
      updateTrackDisplay();
      stopTimer(); // Stop timer when pausing
    }
  });

  els.btnRain.addEventListener('click', toggleRain);
  els.btnVinyl.addEventListener('click', toggleVinyl);

  els.volMusic.addEventListener('input', e => { 
    const value = parseFloat(e.target.value);
    if(mainGain) mainGain.gain.value = value;
    updateVolumeValue(els.musicValue, value);
  });
  els.volRain.addEventListener('input', e => { 
    const value = parseFloat(e.target.value);
    if(rainGain) rainGain.gain.value = value;
    updateVolumeValue(els.rainValue, value);
  });
  els.volVinyl.addEventListener('input', e => { 
    const value = parseFloat(e.target.value);
    if(vinylGain) vinylGain.gain.value = value;
    updateVolumeValue(els.vinylValue, value);
  });
  els.speed.addEventListener('input', e => { 
    const value = parseFloat(e.target.value);
    setPlaybackRate(value);
    updateSpeedValue(value);
  });
}

// --- Media Session ---
function mediaSessionUpdate(artist, title) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || 'Pomodoro Radio',
      artist: artist || '',
      artwork: [
        { src: 'assets/tomato.png', sizes: '192x192', type: 'image/png' },
        { src: 'assets/tomato.png', sizes: '512x512', type: 'image/png' },
      ],
    });
    navigator.mediaSession.setActionHandler('play', () => els.radio.play());
    navigator.mediaSession.setActionHandler('pause', () => els.radio.pause());
  }
}

// --- Metadata via SSE ---
function startMetadata() {
  try {
    const es = new EventSource(streams.metadata);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        const np = data?.now_playing || data?.mount?.now_playing || data;
        const artist = np?.artist || np?.stream_title?.split(' - ')?.[0] || '';
        const title = np?.title || np?.stream_title?.split(' - ')?.[1] || np?.stream_title || '';
        
        // Update media session
        mediaSessionUpdate(artist, title);
        
        // Store track information
        currentTrackInfo = title || data?.streamTitle || 'Unknown Track';
        updateTrackDisplay();
      } catch {}
    };
  } catch (e) {}
}

// --- PWA Support ---
function pwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
  let deferred;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    els.btnInstall.style.display = 'inline-block';
    els.btnInstall.onclick = async () => {
      els.btnInstall.style.display = 'none';
      deferred.prompt();
      deferred = null;
    };
  });
}

// --- Boot ---
window.addEventListener('DOMContentLoaded', () => {
  bindUI();
  pwa();
  initAudio(); // Initialize audio context on page load
  setupSFX();
  startMetadata();
  
  // Initialize timer (but don't start it automatically)
  updateTimer();
  
  // Initialize slider value displays
  updateSpeedValue(parseFloat(els.speed.value));
  updateVolumeValue(els.musicValue, parseFloat(els.volMusic.value));
  updateVolumeValue(els.rainValue, parseFloat(els.volRain.value));
  updateVolumeValue(els.vinylValue, parseFloat(els.volVinyl.value));
  
  // Initialize track display
  updateTrackDisplay();

  els.radio.addEventListener('play', () => setStatus('Playing', '#22c55e'));
  els.radio.addEventListener('pause', () => setStatus('Paused', '#f59e0b'));
  els.radio.addEventListener('stalled', () => setStatus('Buffering…', '#f59e0b'));
  els.radio.addEventListener('waiting', () => setStatus('Buffering…', '#f59e0b'));
  els.radio.addEventListener('error', () => setStatus('Stream error', '#ef4444'));
});
