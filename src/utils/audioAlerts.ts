/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NotificationTone = 'chime' | 'bell' | 'digital' | 'gentle' | 'sharp' | 'none';

export const TONE_OPTIONS: { id: NotificationTone; label: string; desc: string }[] = [
  { id: 'chime', label: 'رنين هادئ (Soft Chime)', desc: 'نغمة كلاسيكية مزدوجة وهادئة' },
  { id: 'bell', label: 'جرس واضح (Bell Ding)', desc: 'جرس عميق وواضح' },
  { id: 'digital', label: 'تنبيه إلكتروني (Digital Beep)', desc: 'نغمة رقمية خفيفة' },
  { id: 'sharp', label: 'نغمة حادة وقوية (Sharp Alert)', desc: 'صوت حاد ومباشر لتنبيه الانتباه' },
  { id: 'gentle', label: 'عزف قيثارة (Gentle Harp)', desc: 'ثلاث نغمات دافئة وناعمة' },
  { id: 'none', label: 'بدون صوت (Silent)', desc: 'كتم الصوت لهذه الفئة' },
];

/**
 * Gets the configured tone for a specific category from localStorage.
 */
export function getToneForCategory(category?: string): NotificationTone {
  const cat = (category || '').toLowerCase();
  if (cat.includes('attendance') || cat.includes('absence') || cat.includes('حضور') || cat.includes('غياب')) {
    return (localStorage.getItem('sams_tone_attendance') || 'chime') as NotificationTone;
  }
  if (cat.includes('fee') || cat.includes('payment') || cat.includes('مالي') || cat.includes('رسوم')) {
    return (localStorage.getItem('sams_tone_fees') || 'bell') as NotificationTone;
  }
  if (cat.includes('admin') || cat.includes('system') || cat.includes('إدارة')) {
    return (localStorage.getItem('sams_tone_admin') || 'digital') as NotificationTone;
  }
  return (localStorage.getItem('sams_notification_tone') || 'chime') as NotificationTone;
}

/**
 * Synthesizes clear audio notification tones using the browser's Web Audio API.
 * Does not depend on external MP3 files and works reliably across modern browsers.
 */
export function playNotificationTone(tone?: NotificationTone | string): void {
  try {
    const selectedTone = (tone || localStorage.getItem('sams_notification_tone') || 'chime') as NotificationTone;
    
    if (selectedTone === 'none') return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    if (selectedTone === 'chime') {
      // Soft Two-Tone Chime (E5 -> B5)
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.75);

    } else if (selectedTone === 'bell') {
      // Resonant Bell Ding (A5 - 880Hz)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);

    } else if (selectedTone === 'digital') {
      // Upbeat Double Beep
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.1);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1046.5, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.25);

    } else if (selectedTone === 'sharp') {
      // High-pitch sharp alert (C6 -> G6)
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(1046.5, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(1567.98, now + 0.1);
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.3);

    } else if (selectedTone === 'gentle') {
      // Warm Harp Chord (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const startTime = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    }

  } catch (e) {
    console.warn('Audio tone play error or autoplay restriction:', e);
  }
}
