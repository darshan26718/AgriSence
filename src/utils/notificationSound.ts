/**
 * notificationSound.ts - Web Audio API synthesizer for mobile push-alert chime
 * No external audio files needed; generates clean harmonics in browser.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a notification sound tailored to alert severity.
 */
export function playNotificationChime(severity: 'critical' | 'high' | 'warning' | 'info' = 'critical') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (severity === 'critical') {
      // Urgent dual beep: 880Hz (A5) -> 1046.5Hz (C6) -> 1318.5Hz (E6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15);

      osc2.frequency.setValueAtTime(1046.5, now);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);

      // Repeat second pulse for urgency
      const pulse2Now = now + 0.18;
      const osc3 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1174.66, pulse2Now);
      osc3.frequency.exponentialRampToValueAtTime(1567.98, pulse2Now + 0.12);
      gain2.gain.setValueAtTime(0.22, pulse2Now);
      gain2.gain.exponentialRampToValueAtTime(0.001, pulse2Now + 0.25);
      osc3.connect(gain2);
      gain2.connect(ctx.destination);
      osc3.start(pulse2Now);
      osc3.stop(pulse2Now + 0.25);
    } else {
      // Pleasant alert bell chime: 587.3Hz (D5) -> 880Hz (A5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch {
    // Graceful fallback if audio is blocked by browser autoplay policy
  }

  // Mobile vibration feedback
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (severity === 'critical') {
        navigator.vibrate([150, 80, 200]);
      } else {
        navigator.vibrate([100]);
      }
    }
  } catch {
    // Ignore if not supported
  }
}
