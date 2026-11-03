/**
 * Soft chimes, synthesised (no audio files). Browsers only allow sound after the reader has
 * touched the page, so the welcome chime plays on the first tap or swipe of a visit rather than
 * at load. Can be switched off in Settings.
 */
const KEY = 'omfs-sound';

export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Not remembered in private mode.
  }
}

let ctx: AudioContext | undefined;

/** Notes as [frequency Hz, start s, length s]. */
function play(notes: [number, number, number][], volume: number) {
  if (!soundOn()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const t0 = ctx.currentTime + 0.02;
    for (const [freq, start, len] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      // Quick fade in, long soft fade out: a bell rather than a beep.
      gain.gain.setValueAtTime(0, t0 + start);
      gain.gain.linearRampToValueAtTime(volume, t0 + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + len);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + start);
      osc.stop(t0 + start + len + 0.05);
    }
  } catch {
    // No Web Audio: stay silent.
  }
}

/** E5 then A5: rising and gentle. */
export const playWelcome = () => play([[659.25, 0, 0.5], [880, 0.12, 0.7]], 0.07);
/** A single soft high note when a paper is saved. */
export const playSave = () => play([[1318.5, 0, 0.25]], 0.035);

let welcomed = false;
/** The welcome chime, once per visit, on the first tap or swipe. */
export function welcomeOnce() {
  if (welcomed) return;
  welcomed = true;
  playWelcome();
}
