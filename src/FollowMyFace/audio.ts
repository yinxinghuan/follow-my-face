let context: AudioContext | null = null;
let muted = false;

function ctx() { context ||= new AudioContext(); if (context.state === 'suspended') void context.resume(); return context; }
function tone(freq: number, duration = .07, type: OscillatorType = 'square', delay = 0, end = freq) {
  if (muted) return;
  const audio = ctx(); const now = audio.currentTime + delay;
  const osc = audio.createOscillator(); const gain = audio.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, now); osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
  gain.gain.setValueAtTime(.045, now); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  osc.connect(gain).connect(audio.destination); osc.start(now); osc.stop(now + duration + .02);
}

export const sounds = {
  unlock() { if (!muted) ctx(); },
  setMuted(next: boolean) { muted = next; },
  start() { [330, 440, 660].forEach((f, i) => tone(f, .055, 'square', i * .1)); },
  flip() { tone(1100, .025, 'triangle'); },
  correct(streak: number) { tone(170, .1, 'square', 0, 90); tone(740, .12, 'sine', .02); if (streak === 5 || streak === 10) [880, 1100, 1320].slice(0, streak === 5 ? 2 : 3).forEach((f, i) => tone(f, .08, 'triangle', .11 + i * .055)); },
  wrong() { tone(95, .18, 'sawtooth', 0, 55); },
  finish(high: boolean) { (high ? [520, 780, 1040] : [420, 630]).forEach((f, i) => tone(f, .09, 'triangle', i * .09)); },
};
