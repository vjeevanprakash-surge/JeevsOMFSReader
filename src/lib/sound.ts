/**
 * Soft chimes, synthesised (no audio files). Browsers only allow sound after the reader has
 * touched the page, and on phones only once the finger lifts (touchend / pointerup / click, not
 * pointerdown), so the audio engine is unlocked on those and the welcome chime plays on the first
 * tap or swipe of a visit. iPhones on silent stay silent. Can be switched off in Settings.
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

type Note = [freq: number, start: number, length: number];

let ctx: AudioContext | undefined;
let unlocked = false;
let queued: { notes: Note[]; volume: number } | undefined;

function audio(): AudioContext | undefined {
  try {
    return (ctx ??= new AudioContext());
  } catch {
    return undefined; // no Web Audio
  }
}

function schedule(c: AudioContext, notes: Note[], volume: number) {
  const t0 = c.currentTime + 0.03;
  for (const [freq, start, len] of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    // Quick fade in, long soft fade out: a bell rather than a beep.
    gain.gain.setValueAtTime(0, t0 + start);
    gain.gain.linearRampToValueAtTime(volume, t0 + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + len);
    osc.connect(gain).connect(c.destination);
    osc.start(t0 + start);
    osc.stop(t0 + start + len + 0.05);
  }
}

function play(notes: Note[], volume: number) {
  if (!soundOn()) return;
  const c = audio();
  if (!c) return;
  if (c.state === 'running') return schedule(c, notes, volume);
  // Not allowed yet (no gesture so far): play as soon as the next tap unlocks the audio.
  queued = { notes, volume };
  c.resume()
    .then(() => {
      if (c.state === 'running' && queued) {
        schedule(c, queued.notes, queued.volume);
        queued = undefined;
      }
    })
    .catch(() => undefined);
}

/** Runs inside a gesture that browsers accept for audio: create/resume the context there. */
function unlock() {
  if (unlocked || !soundOn()) return;
  const c = audio();
  if (!c) return;
  // iPhones also want a sound started within the gesture: one silent sample does it.
  const src = c.createBufferSource();
  src.buffer = c.createBuffer(1, 1, 22050);
  src.connect(c.destination);
  src.start(0);
  c.resume()
    .then(() => {
      unlocked = c.state === 'running';
      if (unlocked && queued) {
        schedule(c, queued.notes, queued.volume);
        queued = undefined;
      }
    })
    .catch(() => undefined);
}

if (typeof document !== 'undefined') {
  for (const type of ['touchend', 'pointerup', 'click', 'keydown']) document.addEventListener(type, unlock, { capture: true, passive: true });
}

/** E5 then A5: rising and gentle. */
export const playWelcome = () => play([[659.25, 0, 0.5], [880, 0.12, 0.7]], 0.09);
/** A single soft high note when a paper is saved. */
export const playSave = () => play([[1318.5, 0, 0.25]], 0.05);

let welcomed = false;
/** The welcome chime, once per visit, on the first tap or swipe. */
export function welcomeOnce() {
  if (welcomed) return;
  welcomed = true;
  playWelcome();
}
