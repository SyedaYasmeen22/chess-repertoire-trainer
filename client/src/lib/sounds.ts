/**
 * Sound effects for chess training using Web Audio API
 */

interface AudioContextState {
  audioContext?: AudioContext;
}

const audioState: AudioContextState = {};

/**
 * Initialize Web Audio API context
 */
function getAudioContext(): AudioContext {
  if (!audioState.audioContext) {
    audioState.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioState.audioContext;
}

/**
 * Play a simple beep sound
 */
export function playBeep(frequency: number = 800, duration: number = 100): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (e) {
    console.warn('Audio playback not available:', e);
  }
}

/**
 * Play success sound (ascending tones)
 */
export function playSuccess(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.1;

    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 523.25; // C5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc1.start(now);
    osc1.stop(now + duration);

    // Second tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 659.25; // E5
    gain2.gain.setValueAtTime(0.2, now + duration);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + duration * 2);
    osc2.start(now + duration);
    osc2.stop(now + duration * 2);

    // Third tone
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.value = 783.99; // G5
    gain3.gain.setValueAtTime(0.2, now + duration * 2);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + duration * 3);
    osc3.start(now + duration * 2);
    osc3.stop(now + duration * 3);
  } catch (e) {
    console.warn('Audio playback not available:', e);
  }
}

/**
 * Play error sound (descending tones)
 */
export function playError(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.1;

    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 523.25; // C5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
    osc1.start(now);
    osc1.stop(now + duration);

    // Second tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 392; // G4
    gain2.gain.setValueAtTime(0.2, now + duration);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + duration * 2);
    osc2.start(now + duration);
    osc2.stop(now + duration * 2);

    // Third tone
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.value = 261.63; // C4
    gain3.gain.setValueAtTime(0.2, now + duration * 2);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + duration * 3);
    osc3.start(now + duration * 2);
    osc3.stop(now + duration * 3);
  } catch (e) {
    console.warn('Audio playback not available:', e);
  }
}

/**
 * Play move sound (short click)
 */
export function playMove(): void {
  playBeep(600, 50);
}

/**
 * Play completion sound (triumphant tones)
 */
export function playCompletion(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.15;

    // Base tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 523.25; // C5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + duration * 3);
    osc1.start(now);
    osc1.stop(now + duration * 3);

    // High tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 783.99; // G5
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.2, now + duration);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + duration * 2);
    osc2.start(now + duration);
    osc2.stop(now + duration * 2);
  } catch (e) {
    console.warn('Audio playback not available:', e);
  }
}
