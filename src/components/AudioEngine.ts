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
  const duration = 0.45; // 450ms duration for high sensory richness
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Synthesize crisp paper friction/rustling with wind-rippling flutter
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    // Beautiful interactive envelope: fast rise, gentle slope with double peak micro-fluctuation
    const env = Math.sin(t * Math.PI) * Math.pow(1 - t, 0.85);
    
    // Wind rippling frequency on the page
    const flutter = 1.0 + 0.35 * Math.sin(t * Math.PI * 16);
    const noise = (Math.random() - 0.5) * flutter;
    
    // Tactile fiber crackles/bending stress spikes
    const crackle = (Math.random() > 0.97 ? (Math.random() - 0.5) * 1.9 : 0);
    
    data[i] = (noise * 0.55 + crackle * 0.45) * env * 0.35;
  }

  // Source 1: Paper Rustles & Fiber Stress
  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.Q.setValueAtTime(2.2, ctx.currentTime);
  noiseFilter.frequency.setValueAtTime(3200, ctx.currentTime);
  noiseFilter.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + duration);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.01, ctx.currentTime);
  noiseGain.gain.linearRampToValueAtTime(1.8, ctx.currentTime + 0.08); // High gain multiplier for prominence
  noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  // Source 2: Low-frequency "fwip" air displacement
  const flapOsc = ctx.createOscillator();
  flapOsc.type = "triangle";
  flapOsc.frequency.setValueAtTime(155, ctx.currentTime);
  flapOsc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + duration);

  const flapFilter = ctx.createBiquadFilter();
  flapFilter.type = "lowpass";
  flapFilter.frequency.setValueAtTime(240, ctx.currentTime);

  const flapGain = ctx.createGain();
  flapGain.gain.setValueAtTime(0.001, ctx.currentTime);
  flapGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.06);
  flapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  flapOsc.connect(flapFilter);
  flapFilter.connect(flapGain);
  flapGain.connect(ctx.destination);

  noiseNode.start();
  flapOsc.start();
  flapOsc.stop(ctx.currentTime + duration);
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
