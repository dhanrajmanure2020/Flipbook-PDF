let audioCtx: AudioContext | null = null;
let isMutedGlobal = false;

export const setSoundMuted = (muted: boolean) => {
  isMutedGlobal = muted;
};

export const getSoundMuted = () => {
  return isMutedGlobal;
};

// Safe lazy init
const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      console.warn("Web Audio API is not supported in this frame environment.", e);
    }
  }
  
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  return audioCtx;
};

/**
 * Synthesizes a beautiful physics-based page turn rustle
 */
export const playPageTurnSound = () => {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const sampleRate = ctx.sampleRate;
  const duration = 0.35; // 350ms duration matching the turning visual animation
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate frequency-filtered noise mimicking paper sliding friction
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    // An envelope curve that rises fast then tapers
    const env = Math.sin(t * Math.PI) * Math.pow(1 - t, 1.2);
    // Combined random noise + soft crackle impulses
    const noise = Math.random() - 0.5;
    // Tiny high-frequency crackle spikes
    const crackle = (Math.random() > 0.985 ? (Math.random() - 0.5) * 1.5 : 0);
    
    data[i] = (noise * 0.4 + crackle * 0.6) * env * 0.12;
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  // Filter sweep (Highpass moving into Bandpass to emulate sliding paper tension)
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.setValueAtTime(1.8, ctx.currentTime);
  
  // Sweep frequency down during turn
  filter.frequency.setValueAtTime(2200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noiseNode.start();
};

/**
 * Synthesizes a soft organic click for standard buttons
 */
export const playClickSound = () => {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};
